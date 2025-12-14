import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { Game } from '../../core/models/game.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-games',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
    template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'COMMON.GAMES' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and play your games.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a routerLink="/games/create" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            {{ 'COMMON.CREATE' | translate }}
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
         <div>
           <input type="text" [(ngModel)]="filters.name" placeholder="Search by name..." 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
         </div>
         <div>
           <select [(ngModel)]="filters.status" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
             <option value="">All Statuses</option>
             <option value="waiting">Waiting</option>
             <option value="in_progress">In Progress</option>
             <option value="completed">Completed</option>
           </select>
         </div>
         <div>
           <select [(ngModel)]="filters.language" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
             <option value="">All Languages</option>
             <option value="en">English</option>
             <option value="it">Italian</option>
           </select>
         </div>
      </div>

      <!-- Games List -->
      <div class="mt-8 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
         @for (game of filteredGames(); track game.id) {
            <div class="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800">
                <div class="flex-1 p-6 flex flex-col justify-between">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-indigo-600">
                            {{ game.language | uppercase }}
                        </p>
                        <div class="block mt-2">
                            <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ game.name }}</p>
                            <p class="mt-3 text-base text-gray-500 dark:text-gray-400">
                                Players: {{ game.players.length }} | Questions: {{ game.questions.length }}
                            </p>
                        </div>
                    </div>
                    <div class="mt-6 flex items-center">
                        <div class="flex-shrink-0">
                           <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                 [class.bg-yellow-100]="game.status === 'waiting'"
                                 [class.text-yellow-800]="game.status === 'waiting'"
                                 [class.bg-green-100]="game.status === 'in_progress'"
                                 [class.text-green-800]="game.status === 'in_progress'"
                                 [class.bg-gray-100]="game.status === 'completed'"
                                 [class.text-gray-800]="game.status === 'completed'">
                             {{ game.status | uppercase }}
                           </span>
                        </div>
                        <div class="ml-auto">
                           @if (canPlay(game)) {
                               <button (click)="play(game.id)" class="text-indigo-600 hover:text-indigo-900 font-medium mr-2">
                                  Play
                               </button>
                           }
                           @if (canManage(game)) {
                              <button (click)="duplicate(game)" class="text-gray-600 hover:text-gray-900 font-medium mr-2">
                                  Duplicate
                               </button>
                              <button (click)="deleteGame(game.id)" class="text-red-600 hover:text-red-900 font-medium">
                                  Delete
                               </button>
                           }
                        </div>
                    </div>
                </div>
            </div>
         } @empty {
             <div class="col-span-3 text-center text-gray-500">No games found. Create one!</div>
         }
      </div>
    </div>
  `
})
export class GamesListComponent {
    gameService = inject(GameService);
    authService = inject(AuthService);
    router = inject(Router);

    games = signal<Game[]>([]);
    filters = {
        name: '',
        status: '',
        language: ''
    };

    constructor() {
        // Prompt: "A user can play and start only his games. The admin can enter in every game"
        // "Games, where user can manage games... filter by name, status, language"
        this.gameService.getGames().subscribe(g => this.games.set(g));
    }

    filteredGames() {
        return this.games().filter(g => {
            const matchesName = !this.filters.name || g.name.toLowerCase().includes(this.filters.name.toLowerCase());
            const matchesStatus = !this.filters.status || g.status === this.filters.status;
            const matchesLang = !this.filters.language || g.language === this.filters.language;
            return matchesName && matchesStatus && matchesLang;
        });
    }

    get currentUserId() {
        return this.authService.currentUser()?.uid;
    }

    get isAdmin() {
        return this.authService.currentUser()?.role === 'admin';
    }

    canPlay(game: Game) {
        // "A user can play and start only his games. The admin can enter in every game"
        // Usually "his games" means "games where he is a player".
        // "The admin can enter in every game, seeing the status".
        if (this.isAdmin) return true;
        return game.players.some(p => p.uid === this.currentUserId);
    }

    canManage(game: Game) {
        // "Games, where user can manage games (create, update, delete)." - Admin/Editor?
        const role = this.authService.currentUser()?.role;
        if (role === 'admin' || role === 'editor') return true;
        // Prompt says: "player (can play his games, and duplicate existing games. Can't see Question and Topic menu)"
        // It does NOT explicitly say player can delete/update games.
        return false;
    }

    play(id: string) {
        this.gameService.updateGame(id, { status: 'in_progress' });
        this.router.navigate(['/games', id]);
    }

    duplicate(game: Game) {
        this.router.navigate(['/games/create'], { state: { duplicateGame: game } });
    }

    async deleteGame(id: string) {
        if (confirm('Delete game?')) {
            await this.gameService.deleteGame(id);
        }
    }
}
