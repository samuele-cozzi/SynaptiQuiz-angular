import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../core/services/topic.service';
import { QuestionService } from '../../core/services/question.service';
import { Topic } from '../../core/models/topic.model';
import { Question } from '../../core/models/question.model';

@Component({
    selector: 'app-topic-detail',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    @if (topic) {
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Header with background image -->
        <div class="relative h-64 sm:h-80 overflow-hidden">
          <img [src]="topic.imageUrl" [alt]="topic.text" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <!-- Title overlay -->
          <div class="absolute inset-0 flex items-end">
            <div class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-3xl sm:text-4xl font-bold text-white">{{ topic.text }}</h1>
                </div>
                <button (click)="onBackClick()" type="button" class="inline-flex items-center justify-center rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 text-white transition-all">
                  ← {{ 'COMMON.BACK' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions List -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ 'COMMON.QUESTIONS' | translate }}</h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ questions().length }} {{ questions().length === 1 ? 'question' : 'questions' }}</p>
          </div>

          @if (questions().length > 0) {
            <div class="space-y-4">
              @for (question of questions(); track question.id) {
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ question.text }}</h3>
                      
                      <!-- Difficulty Badge -->
                      <div class="mt-3 flex items-center gap-4">
                        <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': question.difficulty <= 2,
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': question.difficulty === 3,
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': question.difficulty === 4,
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': question.difficulty === 5
                          }">
                          {{ 'COMMON.DIFFICULTY' | translate }}: {{ question.difficulty }}/5
                        </span>
                        
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ question.language | uppercase }}
                        </span>
                      </div>

                      <!-- Answers Preview -->
                      <!-- <div class="mt-4 space-y-2">
                        @for (answer of question.answers; track $index) {
                          <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 mt-1">
                              <div [ngClass]="{
                                'bg-green-500': answer.correct,
                                'bg-gray-300 dark:bg-gray-600': !answer.correct
                              }" class="w-4 h-4 rounded-full"></div>
                            </div>
                            <div class="flex-1">
                              <p class="text-gray-700 dark:text-gray-300">{{ answer.text }}</p>
                              @if (answer.plausibility) {
                                <p class="text-xs text-gray-500 dark:text-gray-400">Plausibility: {{ answer.plausibility }}%</p>
                              }
                            </div>
                          </div>
                        }
                      </div> -->
                    </div>

                    <!-- Actions -->
                    <div class="ml-4 flex-shrink-0">
                      <button type="button" aria-label="Edit Question" title="Edit Question" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h6M5 12l7-7 7 7v6a2 2 0 01-2 2h-4l-8-8z" />
                          </svg>
                          <span class="sr-only">Edit</span>
                        </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p class="text-gray-500 dark:text-gray-400">{{ 'COMMON.NO_DATA' | translate }}</p>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class TopicDetailComponent {
    @Input() topic: Topic | null = null;
    @Output() onBack = new EventEmitter<void>();
    
    topicService = inject(TopicService);
    questionService = inject(QuestionService);
    
    questions = signal<Question[]>([]);

    ngOnInit() {
        if (this.topic) {
            // Fetch all questions and filter by topic
            this.questionService.getQuestions().subscribe(allQuestions => {
                const topicQuestions = allQuestions
                    .filter(q => q.topicId === this.topic!.id)
                    .sort((a, b) => a.difficulty - b.difficulty);
                this.questions.set(topicQuestions);
            });
        }
    }

    onBackClick() {
        this.onBack.emit();
    }
}
