import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../core/services/topic.service';
import { Topic } from '../../core/models/topic.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-topics',
    standalone: true,
    imports: [CommonModule, TranslateModule, FormsModule],
    template: `
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

      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Image</th>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Name</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  @for (topic of filteredTopics(); track topic.id) {
                      <tr>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <img [src]="topic.imageUrl" class="h-10 w-10 rounded object-cover" alt="">
                        </td>
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            {{ topic.text }}
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="openModal(topic)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                              {{ 'COMMON.EDIT' | translate }}
                          </button>
                          <!-- Technically prompt didn't say delete for topic, only update, but usually expected -->
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
  `
})
export class TopicsListComponent {
    topicService = inject(TopicService);

    topics = signal<Topic[]>([]);
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

    openModal(topic?: Topic) {
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
}
