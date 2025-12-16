import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../../core/services/question.service';
import { TopicService } from '../../core/services/topic.service';
import { Question, Answer } from '../../core/models/question.model';
import { Topic } from '../../core/models/topic.model';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'COMMON.QUESTIONS' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your quiz questions.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
          <button routerLink="/questions/generate" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto">
            Generate with AI
          </button>
          <button (click)="openModal()" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            {{ 'COMMON.CREATE' | translate }}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
        <div>
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Text Search</label>
           <input type="text" [(ngModel)]="filters.text" placeholder="Search..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
        </div>
        <div>
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
           <select [(ngModel)]="filters.topicId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
             <option value="">All Topics</option>
             @for (topic of topics(); track topic.id) {
               <option [value]="topic.id">{{ topic.text }}</option>
             }
           </select>
        </div>
        <div>
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
           <select [(ngModel)]="filters.difficulty" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
             <option [ngValue]="null">All</option>
             <option [ngValue]="1">1</option>
             <option [ngValue]="2">2</option>
             <option [ngValue]="3">3</option>
             <option [ngValue]="4">4</option>
             <option [ngValue]="5">5</option>
           </select>
        </div>
         <div>
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
           <select [(ngModel)]="filters.language" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
             <option value="">All</option>
             <option value="en">English</option>
             <option value="it">Italian</option>
           </select>
        </div>
      </div>

      <!-- Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Text</th>
                     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Topic</th>
                     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Diff</th>
                     <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Lang</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  @for (q of filteredQuestions(); track q.id) {
                      <tr>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ q.text }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ getTopicName(q.topicId) }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ q.difficulty }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ q.language }}</td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="openModal(q)" aria-label="Edit" title="Edit" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h6M5 12l7-7 7 7v6a2 2 0 01-2 2h-4l-8-8z" />
                              </svg>
                              <span class="sr-only">Edit</span>
                          </button>
                           <button (click)="deleteQuestion(q.id)" aria-label="Delete" title="Delete" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11v6M14 11v6" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V4h6v3" />
                              </svg>
                              <span class="sr-only">Delete</span>
                          </button>
                        </td>
                      </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit/Create Modal -->
    @if (showModal) {
        <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                    {{ isEditing ? ('COMMON.EDIT' | translate) : ('COMMON.CREATE' | translate) }} Question
                  </h3>
                  
                  <div class="mt-4 grid grid-cols-1 gap-4">
                     <!-- Question Details -->
                     <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Question Text</label>
                        <input type="text" [(ngModel)]="currentQuestion.text" class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                     </div>
                     
                     <div class="grid grid-cols-3 gap-4">
                        <div>
                           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                           <select [(ngModel)]="currentQuestion.topicId" class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                             @for (topic of topics(); track topic.id) {
                               <option [value]="topic.id">{{ topic.text }}</option>
                             }
                           </select>
                        </div>
                        <div>
                           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                            <select [(ngModel)]="currentQuestion.difficulty" class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                             <option [ngValue]="1">1</option>
                             <option [ngValue]="2">2</option>
                             <option [ngValue]="3">3</option>
                             <option [ngValue]="4">4</option>
                             <option [ngValue]="5">5</option>
                           </select>
                        </div>
                        <div>
                           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                            <select [(ngModel)]="currentQuestion.language" class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                             <option value="en">English</option>
                             <option value="it">Italian</option>
                           </select>
                        </div>
                     </div>

                     <!-- Answers -->
                     <div>
                       <h4 class="text-md font-medium text-gray-900 dark:text-white mb-2">Answers (Check the correct one)</h4>
                       @for (ans of currentQuestion.answers; track $index) {
                          <div class="flex items-center gap-2 mb-2">
                             <input type="radio" name="correctAnswer" [checked]="ans.correct" (change)="setCorrectAnswer($index)" 
                                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                             <input type="text" [(ngModel)]="ans.text" placeholder="Answer Text" 
                                    class="block w-full rounded-md border-gray-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
                             <input type="number" [(ngModel)]="ans.plausibility" placeholder="%" 
                                    class="block w-20 rounded-md border-gray-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" title="Plausibility %">
                          </div>
                       }
                     </div>

                  </div>

                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" (click)="saveQuestion()" [disabled]="!isValid()"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                    {{ 'COMMON.SAVE' | translate }}
                  </button>
                  <button type="button" (click)="closeModal()" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500">
                    {{ 'COMMON.CANCEL' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    }
  `
})
export class QuestionsListComponent {
  questionService = inject(QuestionService);
  topicService = inject(TopicService);

  questions = signal<Question[]>([]);
  topics = signal<Topic[]>([]);

  filters = {
    text: '',
    topicId: '',
    difficulty: null as number | null,
    language: ''
  };

  // Modal
  showModal = false;
  isEditing = false;
  currentQuestion: Partial<Question> = this.getEmptyQuestion();

  constructor() {
    this.topicService.getTopics().subscribe(t => this.topics.set(t));
    this.questionService.getQuestions().subscribe(q => this.questions.set(q));

    // We check localStorage for default language setting in Options, handled by Translation Service actually.
    // But maybe we want the default new question to imply current language? 
    // User requirement: "Options where the user can select... the language of the application, that will be used as default language for games and questions creation"
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'en' || storedLang === 'it') {
      // We will set this when opening modal
    }
  }

  getEmptyQuestion(): Partial<Question> {
    return {
      text: '',
      topicId: '',
      difficulty: 1,
      language: (localStorage.getItem('language') as 'en' | 'it') || 'en',
      answers: [
        { text: '', correct: true, plausibility: 0 },
        { text: '', correct: false, plausibility: 0 },
        { text: '', correct: false, plausibility: 0 },
        { text: '', correct: false, plausibility: 0 }
      ]
    };
  }

  filteredQuestions() {
    return this.questions().filter(q => {
      const matchesText = !this.filters.text || q.text.toLowerCase().includes(this.filters.text.toLowerCase());
      const matchesTopic = !this.filters.topicId || q.topicId === this.filters.topicId;
      const matchesDiff = this.filters.difficulty === null || q.difficulty === this.filters.difficulty;
      const matchesLang = !this.filters.language || q.language === this.filters.language;
      return matchesText && matchesTopic && matchesDiff && matchesLang;
    });
  }

  getTopicName(id: string) {
    return this.topics().find(t => t.id === id)?.text || 'Unknown';
  }

  openModal(q?: Question) {
    this.showModal = true;
    if (q) {
      this.isEditing = true;
      // Deep copy answers
      this.currentQuestion = {
        ...q,
        answers: q.answers.map(a => ({ ...a }))
      };
    } else {
      this.isEditing = false;
      this.currentQuestion = this.getEmptyQuestion();
    }
  }

  closeModal() {
    this.showModal = false;
  }

  setCorrectAnswer(index: number) {
    if (this.currentQuestion.answers) {
      this.currentQuestion.answers.forEach((a, i) => a.correct = i === index);
    }
  }

  isValid() {
    const q = this.currentQuestion;
    if (!q.text || !q.topicId || !q.difficulty || !q.language) return false;
    // All answers must have text
    if (!q.answers || q.answers.some(a => !a.text)) return false;
    return true;
  }

  async saveQuestion() {
    if (this.isEditing && this.currentQuestion.id) {
      await this.questionService.updateQuestion(this.currentQuestion.id, {
        text: this.currentQuestion.text,
        topicId: this.currentQuestion.topicId,
        difficulty: this.currentQuestion.difficulty,
        language: this.currentQuestion.language,
        answers: this.currentQuestion.answers
      });
    } else {
      await this.questionService.addQuestion(this.currentQuestion as any);
    }
    this.closeModal();
  }

  async deleteQuestion(id: string) {
    if (confirm('Are you sure?')) {
      await this.questionService.deleteQuestion(id);
    }
  }
}
