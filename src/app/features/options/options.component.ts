import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-options',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {{ 'COMMON.OPTIONS' | translate }}
      </h1>
      
      <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {{ 'COMMON.THEME' | translate }}
          </h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p>Select your preferred theme.</p>
          </div>
          <div class="mt-5">
            <button type="button" (click)="setTheme('light')" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Light
            </button>
            <button type="button"  (click)="setTheme('dark')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Dark
            </button>
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
             {{ 'COMMON.LANGUAGE' | translate }}
          </h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p>Select your preferred language.</p>
          </div>
          <div class="mt-5">
            <button type="button" (click)="setLanguage('en')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 dark:bg-gray-700 dark:text-white dark:border-gray-600">
              English
            </button>
            <button type="button" (click)="setLanguage('it')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600">
              Italiano
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OptionsComponent {
    translate = inject(TranslateService);

    setTheme(theme: 'light' | 'dark') {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }

    setLanguage(lang: string) {
        this.translate.use(lang);
        localStorage.setItem('language', lang);
    }

    constructor() {
        // Init from local storage
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        const lang = localStorage.getItem('language');
        if (lang) {
            this.translate.use(lang);
        }
    }
}
