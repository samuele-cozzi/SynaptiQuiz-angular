import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Game, GamePlayer, PlayerAnswer } from '../models/game.model';
import { Player } from '../models/player.model';
import { Question } from '../models/question.model';
import { AuthService } from './auth.service';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private playerService = inject(PlayerService);
    private gamesCollection = collection(this.firestore, 'games');

    getGames(): Observable<Game[]> {
        return collectionData(this.gamesCollection, { idField: 'id' }) as Observable<Game[]>;
    }

    getUserGames(userId: string): Observable<Game[]> {
        // In a real app we would index 'players' array. 
        // Firestore array-contains-any logic for 'players' or 'createdBy'.
        // For now, simpler client side filtering or just get all games and filter.
        // Or better: Query games where players array contains an object with uid == userId is hard in NoSQL without specific structure.
        // Simpler approach for v1: store playerIds array in Game for querying.
        // Since we didn't define it in model, we will fetch all and filter client side or assume we modify model later.
        return collectionData(this.gamesCollection, { idField: 'id' }) as Observable<Game[]>;
    }

    async createGame(game: Omit<Game, 'id' | 'createdAt' | 'currentQuestionIndex' | 'playerAnswers' | 'status' | 'currentTurnPlayerId'>) {
        const newGame = {
            ...game,
            status: 'waiting',
            currentQuestionIndex: 0,
            playerAnswers: [],
            createdAt: new Date(),
            // Initialize first turn? Typically needed.
            currentTurnPlayerId: game.players[0].uid
        };
        return addDoc(this.gamesCollection, newGame);
    }

    async updateGame(id: string, data: Partial<Game>) {
        const docRef = doc(this.firestore, 'games', id);
        return updateDoc(docRef, data);
    }

    async deleteGame(id: string) {
        const docRef = doc(this.firestore, 'games', id);
        return deleteDoc(docRef);
    }

    async submitAnswer(gameId: string, game: Game, questionId: string, answerIndex: number) {
        // Validate Turn
        const currentUser = this.authService.currentUser();
        if (!currentUser || (game.currentTurnPlayerId !== currentUser.uid) && this.authService.currentUser()?.role !== 'admin') {
            throw new Error('Not your turn!');
        }

        const question = game.questions.find(q => q.id === questionId);
        if (!question) throw new Error('Question not found');

        const isCorrect = question.answers[answerIndex].correct;
        // Points logic: 10, 20, 50, 100, 150 respect to difficulties (1-5)
        const pointsMap: { [key: number]: number } = { 1: 10, 2: 20, 3: 30, 4: 50, 5: 70 };
        const points = isCorrect ? (pointsMap[question.difficulty] || 10) : -(pointsMap[question.difficulty] || 10) / 2;

        const newAnswer: PlayerAnswer = {
            playerId: game.currentTurnPlayerId,
            questionId,
            answerIndex,
            isCorrect,
            points,
            timestamp: new Date()
        };

        const updatedAnswers = [...game.playerAnswers, newAnswer];

        // Update Player Score
        const updatedPlayers = game.players.map(p => {
            if (p.uid === game.currentTurnPlayerId) {
                return { ...p, score: p.score + points };
            }
            return p;
        });

        // Advance Turn
        let nextQuestionIndex = game.currentQuestionIndex;
        // Logic: "players take turns choosing a question"? 
        // Prompt says: "A user can start his games, the players take turns choosing a question and answering until there are no more questions."
        // This implies: 
        // 1. Current Player picks a question? Or purely sequential?
        // "choosing a question" suggests selection. 
        // "Validation rule are The number of questions should be divisible by the number of player"
        // This suggests everyone answers equal number of questions.
        // If they "choose", maybe they pick from the pool of unanswered questions.

        // Let's implement "Choose from remaining":
        // We mark question as answered.
        // Next Turn: Rotate player.

        const currentPlayerIndex = game.players.findIndex(p => p.uid === currentUser.uid);
        const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        const nextTurnPlayerId = game.players[nextPlayerIndex].uid;

        // Status update
        const allQuestionsAnswered = updatedAnswers.length >= game.questions.length;
        const status = allQuestionsAnswered ? 'completed' : 'in_progress';
        const completedAt = allQuestionsAnswered ? new Date() : undefined;

        // If completed, update player statistics
        if (allQuestionsAnswered) {
            // Determine winner(s) - player(s) with highest score
            const maxScore = Math.max(...updatedPlayers.map(p => p.score));
            const winners = updatedPlayers.filter(p => p.score === maxScore);

            // Update each player's statistics
            for (const gamePlayer of updatedPlayers) {
                try {
                    // Fetch current player data from Firestore
                    const playerDocRef = doc(this.firestore, 'players', gamePlayer.uid);
                    const playerSnap = await getDoc(playerDocRef);

                    if (playerSnap.exists()) {
                        const currentPlayerData = playerSnap.data() as Player;
                        const isWinner = winners.some(w => w.uid === gamePlayer.uid);

                        // Update player statistics
                        await this.playerService.updatePlayer(gamePlayer.uid, {
                            gamesPlayed: (currentPlayerData.gamesPlayed || 0) + 1,
                            totalPoints: (currentPlayerData.totalPoints || 0) + gamePlayer.score,
                            gamesWon: isWinner ? (currentPlayerData.gamesWon || 0) + 1 : currentPlayerData.gamesWon
                        });
                    }
                } catch (error) {
                    console.error(`Failed to update stats for player ${gamePlayer.uid}:`, error);
                    // Continue updating other players even if one fails
                }
            }
        }

        const docRef = doc(this.firestore, 'games', gameId);
        const updates: any = {
            playerAnswers: updatedAnswers,
            players: updatedPlayers,
            currentTurnPlayerId: nextTurnPlayerId,
            currentSelectedQuestionId: null, // Clear selection after answer
            currentQuestion: null,
            status
        };

        // Only include completedAt if the game is actually completed
        if (allQuestionsAnswered) {
            updates.completedAt = new Date();
        }

        await updateDoc(docRef, updates);
    }
}
