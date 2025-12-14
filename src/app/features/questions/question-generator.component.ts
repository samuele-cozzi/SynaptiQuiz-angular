import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';
import { QuestionService } from '../../core/services/question.service';
import { TopicService } from '../../core/services/topic.service';
import { Question } from '../../core/models/question.model';
import { Topic } from '../../core/models/topic.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-question-generator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6 text-white">Generate Questions with AI</h1>
      
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 text-white">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Topic -->
          <div>
            <label class="block text-sm font-medium mb-2">Topic</label>
            <select [(ngModel)]="selectedTopicId" class="w-full p-2 rounded bg-gray-700 border-gray-600 focus:border-blue-500 text-white">
              <option value="" disabled>Select a topic</option>
              <option *ngFor="let topic of topics()" [value]="topic.id">{{ topic.text }}</option>
            </select>
          </div>

          <!-- Language -->
          <div>
            <label class="block text-sm font-medium mb-2">Language</label>
            <select [(ngModel)]="language" class="w-full p-2 rounded bg-gray-700 border-gray-600 focus:border-blue-500 text-white">
              <option value="en">English</option>
              <option value="it">Italian</option>
            </select>
          </div>

          <!-- Difficulties -->
          <div>
            <label class="block text-sm font-medium mb-2">Difficulties</label>
            <div class="flex gap-4">
              <label *ngFor="let d of [1,2,3,4,5]" class="flex items-center">
                <input type="checkbox" [checked]="selectedDifficulties.includes(d)" (change)="toggleDifficulty(d)" class="mr-2">
                {{ d }}
              </label>
            </div>
          </div>

          <!-- Count -->
          <div>
            <label class="block text-sm font-medium mb-2">Count per Difficulty</label>
            <input type="number" [(ngModel)]="count" min="1" max="10" class="w-full p-2 rounded bg-gray-700 border-gray-600 focus:border-blue-500 text-white">
          </div>
        </div>

        <button (click)="generate()" [disabled]="loading() || !selectedTopicId" 
          class="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded hover:opacity-90 disabled:opacity-50">
          {{ loading() ? 'Generating...' : 'Generate Questions' }}
        </button>
      </div>

      <!-- Preview -->
      <div *ngIf="generatedQuestions().length > 0" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Preview ({{ generatedQuestions().length }})</h2>
          <button (click)="saveAll()" [disabled]="saving()" 
            class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Save All to Database' }}
          </button>
        </div>

        <div *ngFor="let q of generatedQuestions()" class="bg-gray-800 p-4 rounded border-l-4 border-blue-500">
          <div class="flex justify-between mb-2">
            <span class="text-xs font-bold px-2 py-1 rounded bg-gray-700 text-gray-300">Diff: {{ q.difficulty }}</span>
            <span class="text-xs font-bold px-2 py-1 rounded bg-gray-700 text-gray-300">{{ q.language }}</span>
          </div>
          <p class="text-lg font-medium text-white mb-4">{{ q.text }}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div *ngFor="let a of q.answers" 
              [class.bg-green-900]="a.correct" 
              [class.border-green-500]="a.correct"
              class="p-2 rounded bg-gray-700 border border-transparent">
              <span class="text-gray-200">{{ a.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuestionGeneratorComponent {
    private aiService = inject(AiService);
    private questionService = inject(QuestionService);
    private topicService = inject(TopicService);
    private router = inject(Router);

    topics = signal<Topic[]>([]);
    selectedTopicId = '';
    language: 'en' | 'it' = 'en';
    selectedDifficulties: number[] = [1];
    count = 2;

    loading = signal(false);
    saving = signal(false);
    generatedQuestions = signal<Partial<Question>[]>([]);

    constructor() {
        this.topicService.getTopics().subscribe(t => {
            this.topics.set(t);
        });
    }

    toggleDifficulty(d: number) {
        if (this.selectedDifficulties.includes(d)) {
            this.selectedDifficulties = this.selectedDifficulties.filter(x => x !== d);
        } else {
            this.selectedDifficulties.push(d);
        }
    }

    async generate() {
        if (!this.selectedTopicId || this.selectedDifficulties.length === 0) return;

        const selectedTopic = this.topics().find(t => t.id === this.selectedTopicId);
        if (!selectedTopic) return;

        this.loading.set(true);
        try {
            const questions = await this.aiService.generateQuestions(
                selectedTopic.text,
                this.language,
                this.selectedDifficulties,
                this.count
            );
            this.generatedQuestions.set(questions);
        } catch (error) {
            alert('Failed to generate questions. Check console/API key.');
        } finally {
            this.loading.set(false);
        }
    }

    async saveAll() {
        this.saving.set(true);
        try {
            for (const q of this.generatedQuestions()) {
                await this.questionService.addQuestion({
                    text: q.text!,
                    topicId: this.selectedTopicId,
                    difficulty: q.difficulty!,
                    language: q.language!,
                    answers: q.answers!
                });
            }
            alert('Questions saved successfully!');
            this.router.navigate(['/questions']); // Redirect to questions list properly
            // Note: route in app.routes is 'questions', not 'dashboard/questions' based on previous context, but user has layout so path might be relative. 
            // The routerLink in sidebar works, so '/questions' or '/dashboard/questions' depending on route structure.
            // app.routes.ts shows 'questions' is a child of '', same level as 'dashboard'.
            // So '/questions' is correct.
        } catch (error) {
            console.error(error);
            alert('Error saving questions');
        } finally {
            this.saving.set(false);
        }
    }
}
