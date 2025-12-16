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
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ 'COMMON.GAMES' | translate }}
          </h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">Manage and play your games.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a
            routerLink="/games/create"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            {{ 'COMMON.CREATE' | translate }}
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
        <div>
          <input
            type="text"
            [(ngModel)]="filters.name"
            placeholder="Search by name..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          />
        </div>
        <div>
          <select
            [(ngModel)]="filters.status"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          >
            <option value="">All Statuses</option>
            <option value="waiting">Waiting</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <select
            [(ngModel)]="filters.language"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="it">Italian</option>
          </select>
        </div>
      </div>

      <!-- Games List (rows) -->
      <div class="mt-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Language</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Players</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Questions</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              @for (game of filteredGames(); track game.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-0">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ game.name }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ game.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ game.language | uppercase }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ game.players.length }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ game.questions.length }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class.bg-yellow-100]="game.status === 'waiting'"
                    [class.text-yellow-800]="game.status === 'waiting'"
                    [class.bg-green-100]="game.status === 'in_progress'"
                    [class.text-green-800]="game.status === 'in_progress'"
                    [class.bg-gray-100]="game.status === 'completed'"
                    [class.text-gray-800]="game.status === 'completed'"
                  >
                    {{ game.status | uppercase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  @if (canView(game)) {
                  <button (click)="viewGame(game.id)" aria-label="View" title="View" class="text-indigo-600 hover:text-indigo-900 font-medium mr-3">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span class="sr-only">View</span>
                  </button>
                  }
                  @if (canPlay(game)) {
                  <button (click)="play(game.id)" aria-label="Play" title="Play" class="text-indigo-600 hover:text-indigo-900 font-medium mr-3">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
                    </svg>
                    <span class="sr-only">Play</span>
                  </button>
                  }
                  @if (canManage(game)) {
                  <button (click)="duplicate(game)" aria-label="Duplicate" title="Duplicate" class="text-gray-600 hover:text-gray-900 font-medium mr-3">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="10" height="10" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
                      <rect x="4" y="4" width="10" height="10" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect>
                    </svg>
                    <span class="sr-only">Duplicate</span>
                  </button>
                  <button (click)="deleteGame(game.id)" aria-label="Delete" title="Delete" class="text-red-600 hover:text-red-900 font-medium">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11v6M14 11v6" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7V4h6v3" />
                    </svg>
                    <span class="sr-only">Delete</span>
                  </button>
                  }
                </td>
              </tr>
              } @empty {
              <tr>
                <td class="px-6 py-4 text-center text-gray-500" colspan="6">No games found. Create one!</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class GamesListComponent {
  gameService = inject(GameService);
  authService = inject(AuthService);
  router = inject(Router);

  games = signal<Game[]>([]);
  filters = {
    name: '',
    status: '',
    language: '',
  };

  constructor() {
    // Prompt: "A user can play and start only his games. The admin can enter in every game"
    // "Games, where user can manage games... filter by name, status, language"
    this.gameService.getGames().subscribe((g) => this.games.set(g));
  }

  filteredGames() {
    return this.games().filter((g) => {
      const matchesName =
        !this.filters.name || g.name.toLowerCase().includes(this.filters.name.toLowerCase());
      const matchesStatus = !this.filters.status || g.status === this.filters.status;
      const matchesLang = !this.filters.language || g.language === this.filters.language;
      const iserId = this.isAdmin || g.players.some(obj => obj.uid === this.currentUserId);
      return matchesName && matchesStatus && matchesLang && iserId;
    });
  }

  get currentUserId() {
    return this.authService.currentUser()?.uid;
  }

  get isAdmin() {
    return this.authService.currentUser()?.role === 'admin';
  }

  canView(game: Game) {
    // "A user can play and start only his games. The admin can enter in every game"
    // Usually "his games" means "games where he is a player".
    // "The admin can enter in every game, seeing the status".
    if (game.status === 'completed') return true;
    return false;
  }

  canPlay(game: Game) {
    // "A user can play and start only his games. The admin can enter in every game"
    // Usually "his games" means "games where he is a player".
    // "The admin can enter in every game, seeing the status".
    if (game.status === 'completed') return false;
    if (this.isAdmin) return true;
    return game.players.some((p) => p.uid === this.currentUserId);
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

  viewGame(id: string) {
    this.router.navigate(['/leaderboard'], { queryParams: { gameId: id } });
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
