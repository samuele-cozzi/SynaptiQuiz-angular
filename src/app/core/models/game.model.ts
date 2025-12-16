import { Player } from './player.model';
import { Question } from './question.model';

export type GameStatus = 'waiting' | 'in_progress' | 'completed';

export interface GamePlayer extends Player {
    score: number;
    // Lifelines / helpers available to the player
    externalHelps?: number; // number of external helps available (e.g., consult a friend)
    fiftyFifty?: number; // number of 50/50 lifelines
    switches?: number; // number of question switches available
}

export interface PlayerAnswer {
    playerId: string;
    questionId: string;
    answerIndex: number;
    isCorrect: boolean;
    points: number;
    timestamp: Date;
}

export interface Game {
    id: string;
    name: string;
    language: 'en' | 'it';
    createdBy: string; // User ID
    status: GameStatus;

    players: GamePlayer[]; // List of X players
    questions: Question[]; // List of Y questions
    currentQuestion: Question | null; // Current question being answered

    // State
    currentQuestionIndex: number;
    currentTurnPlayerId: string; // ID of player whose turn it is
    currentSelectedQuestionId?: string | null; // ID of question currently selected by current player
    playerAnswers: PlayerAnswer[]; // History of answers

    createdAt: Date;
    completedAt?: Date;
}
