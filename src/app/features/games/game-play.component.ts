import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { Game, GamePlayer, PlayerAnswer } from '../../core/models/game.model';
import { Question } from '../../core/models/question.model';
import { Subscription, interval, takeWhile } from 'rxjs';

@Component({
    selector: 'app-game-play',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (game(); as g) {
        
        <!-- Header -->
        <div class="md:flex md:items-center md:justify-between mb-6">
           <div>
              <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                {{ g.name }}
              </h2>
              <p class="text-sm text-gray-500">Status: {{ g.status }} | Questions: {{ g.playerAnswers.length }}/{{ g.questions.length }}</p>
           </div>
           
           @if (g.status === 'completed') {
               <button (click)="viewLeaderboard()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                   View Leaderboard
               </button>
           }
        </div>

        @if (g.status !== 'completed') {
           <!-- Turn Indicator -->
           <div class="bg-indigo-50 dark:bg-indigo-900 border-l-4 border-indigo-400 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <!-- Info Icon -->
                  <svg class="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-indigo-700 dark:text-indigo-200">
                    Current Turn: <span class="font-bold">{{ getPlayerName(g.currentTurnPlayerId) }}</span>
                    @if (isMyTurn(g)) { (YOU) }
                  </p>
                </div>
              </div>
           </div>

           <!-- Question Area -->
           @if (currentQuestion(); as q) {
             <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Question {{ g.playerAnswers.length + 1 }}
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">
                        Difficulty: {{ q.difficulty }} | Topic: {{ q.topicId }}
                    </p>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                    <p class="text-xl text-gray-900 dark:text-white mb-6 font-semibold">{{ q.text }}</p>
                    
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        @for (ans of q.answers; track $index) {
                            <button (click)="submitAnswer(g, q.id, $index)" 
                                    [disabled]="!isMyTurn(g)"
                                    class="relative block w-full border rounded-lg p-4 text-left hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:hover:border-indigo-400 dark:bg-gray-700"
                                    [class.opacity-50]="!isMyTurn(g)"
                                    [class.cursor-not-allowed]="!isMyTurn(g)">
                                <span class="font-medium text-gray-900 dark:text-white">{{ ans.text }}</span>
                            </button>
                        }
                    </div>
                </div>
             </div>
           } @else {
               <div class="text-center py-10">
                   <p class="text-gray-500">Loading next question...</p>
               </div>
           }

        } @else {
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Game Completed</h3>
                <div class="mt-6">
                    <button (click)="viewLeaderboard()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      See Leaderboard
                    </button>
                </div>
            </div>
        }
      } @else {
          <div class="text-center p-8">Loading Game...</div>
      }
    </div>
  `
})
export class GamePlayComponent implements OnInit, OnDestroy {
    route = inject(ActivatedRoute);
    router = inject(Router);
    gameService = inject(GameService);
    authService = inject(AuthService);
    firestore = inject(Firestore);

    game = signal<Game | null>(null);
    gameSub?: Subscription;

    // We need to determine "Current Question".
    // Logic: The game has a list of questions. 'playerAnswers' tracks which are answered.
    // The prompt says "questions with player answers".
    // Simplest: Find first question ID not in playerAnswers.
    // Or better: Use currentQuestionIndex if we maintained it properly. But index in array is easier.
    currentQuestion = signal<Question | null>(null);

    ngOnInit() {
        const gameId = this.route.snapshot.paramMap.get('id');
        if (gameId) {
            const docRef = doc(this.firestore, 'games', gameId);
            this.gameSub = docData(docRef, { idField: 'id' }).subscribe((g: any) => {
                if (g) {
                    this.game.set(g as Game);
                    this.updateCurrentQuestion(g as Game);
                }
            });
        }
    }

    ngOnDestroy() {
        this.gameSub?.unsubscribe();
    }

    updateCurrentQuestion(g: Game) {
        if (g.status === 'completed') {
            this.currentQuestion.set(null);
            return;
        }

        // The prompt said "questions should be divisible by players".
        // And "players take turns choosing a question". 
        // If we implement "choose", we need a UI to Pick Question.
        // But my previous implementation in GameService assumed `currentQuestionIndex` approach (Linear).
        // "choosing a question" is slightly ambiguous. Does it mean "Answering a question"?
        // Usually quiz games are linear.
        // If "choosing a question" means picking from a category (like Jeopardy), that's different.
        // Given "Validation rule are The number of questions should be divisible by the number of player", 
        // it strongly implies a round-robin answering.
        // I will stick to Linear for now as it's safer for "Progressive Web App" MVP unless explicitly "Jeopardy style".
        // Wait, "The user can filter... questions... The validation rule...".
        // If "Choosing a question" means picking topic/difficulty DURING game, that contradicts "Game Creation" step where we select questions.
        // So "Choosing a question" likely just means "Navigating to the question assigned to them".
        // Let's stick to Linear: Questions are ordered in `g.questions`.

        // Calculate which question is next
        const answeredCount = g.playerAnswers.length;
        if (answeredCount < g.questions.length) {
            this.currentQuestion.set(g.questions[answeredCount]);
        } else {
            this.currentQuestion.set(null);
        }
    }

    getPlayerName(uid: string) {
        return this.game()?.players.find(p => p.uid === uid)?.username || 'Unknown';
    }

    isMyTurn(g: Game) {
        return g.status === 'in_progress' && g.currentTurnPlayerId === this.authService.currentUser()?.uid;
    }

    async submitAnswer(g: Game, qId: string, aIndex: number) {
        if (!this.isMyTurn(g)) return;
        try {
            await this.gameService.submitAnswer(g.id, g, qId, aIndex);
        } catch (e) {
            alert(e); // Simple error handling
        }
    }

    viewLeaderboard() {
        // Navigate to leaderboard with filters
        // "The leaderboard page has 2 flawor, one global with point of every game, and one filtered for the game."
        // So we can pass query param ?gameId=...
        this.router.navigate(['/leaderboard'], { queryParams: { gameId: this.game()?.id } });
    }
}
