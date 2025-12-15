import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../core/services/topic.service';
import { Topic } from '../../core/models/topic.model';
import { FormsModule } from '@angular/forms';
import { TopicDetailComponent } from './topic-detail.component';

@Component({
    selector: 'app-topics',
    standalone: true,
    imports: [CommonModule, TranslateModule, FormsModule, TopicDetailComponent],
    template: `
    @if (selectedTopic()) {
      <app-topic-detail [topic]="selectedTopic()" (onBack)="onTopicDetailBack()"></app-topic-detail>
    } @else {
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'COMMON.TOPICS' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all topics used for categorizing questions.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button (click)="openModal()" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            {{ 'COMMON.CREATE' | translate }}
          </button>
        </div>
      </div>
      
      <!-- Filter -->
       <div class="mt-4">
          <input type="text" [(ngModel)]="searchTerm" placeholder="{{ 'COMMON.SEARCH' | translate }}..." 
                 class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
      </div>

      <!-- Card View -->
      <div class="mt-8">
        @if (filteredTopics().length > 0) {
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (topic of filteredTopics(); track topic.id) {
              <div class="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer group" (click)="selectedTopic.set(topic)">
                <!-- Image Container -->
                <div class="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img [src]="topic.imageUrl" alt="{{ topic.text }}" class="h-full w-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                
                <!-- Content Container -->
                <div class="p-4 flex flex-col justify-between h-24">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {{ topic.text }}
                  </h3>
                  
                  <!-- Edit Button -->
                  <button (click)="openModal(topic, $event)" class="mt-2 w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors">
                    {{ 'COMMON.EDIT' | translate }}
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400">{{ 'COMMON.NO_DATA' | translate }}</p>
          </div>
        }
      </div>
    </div>

    <!-- Simple Modal - In a real app, use a proper Dialog service or component -->
    @if (showModal) {
        <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                    {{ isEditing ? ('COMMON.EDIT' | translate) : ('COMMON.CREATE' | translate) }} Topic
                  </h3>
                  <div class="mt-2 space-y-4">
                     <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input type="text" [(ngModel)]="currentTopic.text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
                     </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                        <input type="text" [(ngModel)]="currentTopic.imageUrl" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
                        @if (currentTopic.imageUrl) {
                            <img [src]="currentTopic.imageUrl" class="mt-2 h-20 w-20 object-cover rounded">
                        }
                     </div>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" (click)="saveTopic()" [disabled]="!currentTopic.text"
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
    }
  `
})
export class TopicsListComponent {
    topicService = inject(TopicService);

    topics = signal<Topic[]>([]);
    selectedTopic = signal<Topic | null>(null);
    searchTerm = '';

    // Modal State
    showModal = false;
    isEditing = false;
    currentTopic: Partial<Topic> = { text: '', imageUrl: '' };

    constructor() {
        this.topicService.getTopics().subscribe(t => {
            this.topics.set(t);
        });
    }

    filteredTopics() {
        return this.topics().filter(t =>
            !this.searchTerm || t.text.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    openModal(topic?: Topic, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.showModal = true;
        if (topic) {
            this.isEditing = true;
            this.currentTopic = { ...topic };
        } else {
            this.isEditing = false;
            this.currentTopic = { text: '', imageUrl: '' };
        }
    }

    closeModal() {
        this.showModal = false;
        this.currentTopic = {};
    }

    async saveTopic() {
        if (this.isEditing && this.currentTopic.id) {
            await this.topicService.updateTopic(this.currentTopic.id, {
                text: this.currentTopic.text,
                imageUrl: this.currentTopic.imageUrl
            });
        } else {
            await this.topicService.addTopic({
                text: this.currentTopic.text!,
                imageUrl: this.currentTopic.imageUrl!
            });
        }
        this.closeModal();
    }

    onTopicDetailBack() {
        this.selectedTopic.set(null);
    }
}
