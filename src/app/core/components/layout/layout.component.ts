import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <div class="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      
      <!-- Static sidebar for desktop -->
      <div class="hidden md:flex md:flex-shrink-0">
        <div class="flex flex-col w-64">
          <div class="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800">
            <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div class="flex items-center flex-shrink-0 px-4 gap-2">
                 <img src="assets/logo.svg" alt="SynaptiQuiz" class="h-8 w-8"/>
                 <h1 class="text-gray-900 dark:text-white font-bold text-xl">SynaptiQuiz</h1>
              </div>
              <nav class="mt-5 flex-1 px-2 space-y-1">
                 <a routerLink="/dashboard" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" 
                   class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                   <!-- Icon Home -->
                   <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                   </svg>
                   {{ 'COMMON.DASHBOARD' | translate }}
                </a>

                 <a routerLink="/games" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" 
                   class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                   <!-- Icon Cube -->
                   <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                   </svg>
                   {{ 'COMMON.GAMES' | translate }}
                </a>

                @if (authService.currentUser()?.role !== 'player') {
                      <a routerLink="/questions" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" 
                        class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                       <!-- Icon Question Mark Circle -->
                       <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       {{ 'COMMON.QUESTIONS' | translate }}
                    </a>

                      <a routerLink="/topics" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" 
                        class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                       <!-- Icon Collection -->
                       <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                       </svg>
                       {{ 'COMMON.TOPICS' | translate }}
                    </a>
                }
                
                @if (authService.currentUser()?.role === 'admin') {
                     <a routerLink="/players" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" 
                       class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                       <!-- Icon Users -->
                       <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                       </svg>
                       {{ 'COMMON.PLAYERS' | translate }}
                    </a>
                }
                
                 <a routerLink="/options" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" 
                   class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                   <!-- Icon Cog -->
                   <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   {{ 'COMMON.OPTIONS' | translate }}
                </a>

              </nav>
            </div>
            <div class="flex-shrink-0 flex bg-gray-50 dark:bg-gray-700 p-4">
              <a href="#" (click)="logout($event)" class="flex-shrink-0 w-full group block">
                <div class="flex items-center">
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      {{ 'COMMON.LOGOUT' | translate }}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile header with burger menu -->
      <div class="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 flex justify-between items-center text-gray-900 dark:text-white z-20">
        <div class="flex items-center gap-2">
          <img src="assets/logo.svg" alt="SynaptiQuiz" class="h-6 w-6"/>
          <span class="font-bold text-lg">SynaptiQuiz</span>
        </div>
        <button (click)="toggleMobileMenu()" class="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-white">
            @if (!mobileMenuOpen()) {
            <!-- Hamburger Icon -->
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          } @else {
            <!-- Close Icon -->
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        </button>
      </div>

      <!-- Mobile slide-out menu -->
      @if (mobileMenuOpen()) {
        <!-- Backdrop -->
        <div class="md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-30 transition-opacity" (click)="toggleMobileMenu()"></div>
        
        <!-- Slide-out menu -->
        <div class="md:hidden fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-gray-800 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto">
          <div class="flex flex-col h-full">
            <!-- Menu header -->
              <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-gray-900 dark:text-white font-bold text-lg">Menu</h2>
              <button (click)="toggleMobileMenu()" class="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Menu items -->
            <nav class="flex-1 px-2 py-4 space-y-1">
              <a routerLink="/dashboard" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" (click)="toggleMobileMenu()"
                 class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {{ 'COMMON.DASHBOARD' | translate }}
              </a>

              <a routerLink="/games" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" (click)="toggleMobileMenu()"
                 class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {{ 'COMMON.GAMES' | translate }}
              </a>

              @if (authService.currentUser()?.role !== 'player') {
                <a routerLink="/questions" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" (click)="toggleMobileMenu()"
                   class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-3 text-base font-medium rounded-md">
                  <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ 'COMMON.QUESTIONS' | translate }}
                </a>

                <a routerLink="/topics" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" (click)="toggleMobileMenu()"
                   class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-3 text-base font-medium rounded-md">
                  <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {{ 'COMMON.TOPICS' | translate }}
                </a>
              }

              @if (authService.currentUser()?.role === 'admin') {
                <a routerLink="/players" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" (click)="toggleMobileMenu()"
                   class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-3 text-base font-medium rounded-md">
                  <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {{ 'COMMON.PLAYERS' | translate }}
                </a>
              }

              <a routerLink="/options" routerLinkActive="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white" (click)="toggleMobileMenu()"
                 class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ 'COMMON.OPTIONS' | translate }}
              </a>
            </nav>

            <!-- Logout button at bottom -->
            <div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <button (click)="logout($event); toggleMobileMenu()" class="w-full flex items-center px-2 py-3 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
                <svg class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ 'COMMON.LOGOUT' | translate }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Main content area (shared by mobile and desktop) -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <main class="flex-1 relative overflow-y-auto focus:outline-none md:mt-0 mt-16">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  authService = inject(AuthService);
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
