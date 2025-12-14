import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ 'COMMON.LOGIN' | translate }} - SynaptiQuiz
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          
          <!-- Username Login -->
          <div class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ 'COMMON.USERNAME' | translate }}
              </label>
              <div class="mt-1">
                <input id="username" name="username" type="text" required [(ngModel)]="username"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
            </div>

            <div>
              <button (click)="loginWithUsername()" [disabled]="!username"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ 'COMMON.LOGIN' | translate }}
              </button>
            </div>
          </div>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
              </div>
            </div>

            <div class="mt-6">
              <button (click)="loginWithGoogle()"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                {{ 'COMMON.GOOGLE_LOGIN' | translate }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    authService = inject(AuthService);
    username: string = '';

    loginWithUsername() {
        if (this.username) {
            this.authService.loginWithUsername(this.username);
        }
    }

    loginWithGoogle() {
        this.authService.loginWithGoogle();
    }
}
