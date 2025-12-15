import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { TopicService } from '../../core/services/topic.service';
import { Game, GamePlayer, PlayerAnswer } from '../../core/models/game.model';
import { Question } from '../../core/models/question.model';
import { Topic } from '../../core/models/topic.model';
import { Subscription, interval, takeWhile } from 'rxjs';

interface GroupedQuestion {
    question: Question;
    topicName: string;
}

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

           <!-- Question Selection Mode -->
           @if (!selectedQuestionId()) {
              <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                 <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Select a Question</h3>
                 
                 @for (group of groupedQuestions(); track group.topicName) {
                    <div class="mb-6">
                       <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">{{ group.topicName }}</h4>
                       <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          @for (item of group.questions; track item.question.id) {
                             <button 
                                (click)="selectQuestion(item.question.id)"
                                [disabled]="!isMyTurn(g) && !isAdmin()"
                                class="relative block border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:border-indigo-500 dark:hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors min-h-[80px] sm:min-h-[100px]"
                                [class.opacity-50]="!isMyTurn(g) && !isAdmin()"
                                [class.cursor-not-allowed]="!isMyTurn(g) && !isAdmin()">
                                <div class="text-center">
                                   <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Difficulty</div>
                                   <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ item.question.difficulty }}</div>
                                   <div class="text-xs text-gray-600 dark:text-gray-300 mt-2">{{ item.topicName }}</div>
                                </div>
                             </button>
                          }
                       </div>
                    </div>
                 }
              </div>
           }

           <!-- Question Answer Mode -->
           @if (selectedQuestionId() && (isMyTurn(g) || isAdmin())) {
              @if (currentQuestion(); as q) {
                <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                   <div class="px-4 py-5 sm:px-6">
                       <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                           Question {{ g.playerAnswers.length + 1 }}
                       </h3>
                       <p class="mt-1 max-w-2xl text-sm text-gray-500">
                           Difficulty: {{ q.difficulty }} | Topic: {{ getTopicName(q.topicId) }}
                       </p>
                   </div>
                   <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                       <p class="text-xl text-gray-900 dark:text-white mb-6 font-semibold">{{ q.text }}</p>
                       
                       <div class="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                           @for (ans of q.answers; track $index) {
                               <button (click)="submitAnswer(g, q.id, $index)" 
                                       [disabled]="!isMyTurn(g)"
                                       class="relative block w-full border-2 rounded-lg p-4 text-left hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:hover:border-indigo-400 dark:bg-gray-700 min-h-[60px] transition-colors"
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
                      <p class="text-gray-500">Loading question...</p>
                  </div>
              }
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
    topicService = inject(TopicService);
    firestore = inject(Firestore);

    game = signal<Game | null>(null);
    topics = signal<Topic[]>([]);
    gameSub?: Subscription;
    topicsSub?: Subscription;

    selectedQuestionId = signal<string | null>(null);
    currentQuestion = signal<Question | null>(null);

    isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

    // Compute available questions (not yet answered)
    availableQuestions = computed(() => {
        const g = this.game();
        if (!g) return [];

        const answeredIds = g.playerAnswers.map(a => a.questionId);
        return g.questions.filter(q => !answeredIds.includes(q.id));
    });

    // Group questions by topic and sort by difficulty
    groupedQuestions = computed(() => {
        const available = this.availableQuestions();
        const topicsList = this.topics();

        // Group by topicId
        const groups = new Map<string, GroupedQuestion[]>();

        available.forEach(q => {
            const topic = topicsList.find(t => t.id === q.topicId);
            const topicName = topic?.text || q.topicId;

            if (!groups.has(q.topicId)) {
                groups.set(q.topicId, []);
            }

            groups.get(q.topicId)!.push({ question: q, topicName });
        });

        // Sort each group by difficulty and convert to array
        return Array.from(groups.entries()).map(([topicId, questions]) => ({
            topicId,
            topicName: questions[0].topicName,
            questions: questions.sort((a, b) => a.question.difficulty - b.question.difficulty)
        }));
    });

    ngOnInit() {
        const gameId = this.route.snapshot.paramMap.get('id');
        if (gameId) {
            const docRef = doc(this.firestore, 'games', gameId);
            this.gameSub = docData(docRef, { idField: 'id' }).subscribe((g: any) => {
                if (g) {
                    this.game.set(g as Game);

                    // Sync selected question from game state (so admin can see what current player selected)
                    if (g.currentSelectedQuestionId && g.currentSelectedQuestionId !== this.selectedQuestionId()) {
                        this.selectedQuestionId.set(g.currentSelectedQuestionId);
                    }

                    this.updateCurrentQuestion(g as Game);
                }
            });
        }

        // Load topics for display names
        this.topicsSub = this.topicService.getTopics().subscribe(topics => {
            this.topics.set(topics);
        });
    }


    ngOnDestroy() {
        this.gameSub?.unsubscribe();
        this.topicsSub?.unsubscribe();
    }

    async selectQuestion(questionId: string) {
        const g = this.game();
        if (!g) return;

        // Update local state
        this.selectedQuestionId.set(questionId);
        const question = g.questions.find(q => q.id === questionId);
        this.currentQuestion.set(question || null);

        // Save to Firestore so other players (especially admin) can see the selection
        if (this.isMyTurn(g)) {
            await this.gameService.updateGame(g.id, {
                currentSelectedQuestionId: questionId
            });
        }
    }



    async updateCurrentQuestion(g: Game) {
        if (g.status === 'completed') {
            this.currentQuestion.set(null);
            this.selectedQuestionId.set(null);
            if (this.isMyTurn(g)) {
                await this.gameService.updateGame(g.id, {
                    currentSelectedQuestionId: null
                });
            }
            return;
        }

        // If a question is selected, show it
        if (this.selectedQuestionId()) {
            const question = g.questions.find(q => q.id === this.selectedQuestionId());
            this.currentQuestion.set(question || null);
        } else {
            // For non-current-player, show the first available question
            const available = this.availableQuestions();
            this.currentQuestion.set(available[0] || null);
        }
    }

    getPlayerName(uid: string) {
        return this.game()?.players.find(p => p.uid === uid)?.username || 'Unknown';
    }

    getTopicName(topicId: string) {
        return this.topics().find(t => t.id === topicId)?.text || topicId;
    }

    isMyTurn(g: Game) {
        return g.status === 'in_progress' && g.currentTurnPlayerId === this.authService.currentUser()?.uid;
    }

    async submitAnswer(g: Game, qId: string, aIndex: number) {
        if (!this.isMyTurn(g)) return;
        try {
            await this.gameService.submitAnswer(g.id, g, qId, aIndex);
            // Reset selection after answering
            this.selectedQuestionId.set(null);
            if (this.isMyTurn(g)) {
                await this.gameService.updateGame(g.id, {
                    currentSelectedQuestionId: null
                });
            }
        } catch (e) {
            alert(e);
        }
    }

    viewLeaderboard() {
        this.router.navigate(['/leaderboard'], { queryParams: { gameId: this.game()?.id } });
    }
}
