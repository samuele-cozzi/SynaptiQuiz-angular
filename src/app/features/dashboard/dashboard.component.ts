import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, collection, query, orderBy, limit, collectionData } from '@angular/fire/firestore';
import { Player } from '../../core/models/player.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {{ 'COMMON.DASHBOARD' | translate }}
      </h1>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <img class="h-10 w-10 rounded-full" [src]="authService.currentUser()?.photoURL" alt="Avatar">
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {{ authService.currentUser()?.username }}
                  </dt>
                  <dd>
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ authService.currentUser()?.role | uppercase }}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Games Won Card -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                 <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                 </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Games Won
                  </dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ authService.currentUser()?.gamesWon || 0 }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Games Played Card -->
         <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                 <svg class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Games Played
                  </dt>
                  <dd>
                     <div class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ authService.currentUser()?.gamesPlayed || 0 }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Points Card -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Points
                  </dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900 dark:text-white">
                      {{ authService.currentUser()?.totalPoints || 0 }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Global Leaderboard Section -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Top Players
          </h3>
          <a routerLink="/leaderboard" class="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            View All →
          </a>
        </div>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (player of topPlayers(); track player.uid; let idx = $index) {
            <li class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center min-w-0 flex-1">
                  <span class="text-lg font-bold text-gray-400 dark:text-gray-500 mr-4 w-8">
                    #{{ idx + 1 }}
                  </span>
                  <img class="h-10 w-10 rounded-full flex-shrink-0" [src]="player.photoURL" alt="" />
                  <div class="ml-4 flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ player.username }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ player.gamesPlayed || 0 }} games played
                    </p>
                  </div>
                </div>
                <div class="ml-4 flex items-center space-x-4">
                  <div class="text-right">
                    <p class="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {{ player.gamesWon || 0 }} wins
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ player.totalPoints || 0 }} pts
                    </p>
                  </div>
                </div>
              </div>
            </li>
          } @empty {
            <li class="px-4 py-8 text-center">
              <p class="text-gray-500 dark:text-gray-400">No players yet</p>
            </li>
          }
        </ul>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  firestore = inject(Firestore);

  topPlayers = signal<Player[]>([]);
  private playersSub?: Subscription;

  ngOnInit() {
    this.loadTopPlayers();
  }

  ngOnDestroy() {
    this.playersSub?.unsubscribe();
  }

  loadTopPlayers() {
    const colRef = collection(this.firestore, 'players');
    const q = query(colRef, orderBy('gamesWon', 'desc'), limit(5));
    this.playersSub = collectionData(q, { idField: 'uid' }).subscribe((players) => {
      this.topPlayers.set(players as Player[]);
    });
  }
}
