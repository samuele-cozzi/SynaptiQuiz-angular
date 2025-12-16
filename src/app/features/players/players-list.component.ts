import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerService } from '../../core/services/player.service';
import { Player, PlayerRole } from '../../core/models/player.model';

@Component({
    selector: 'app-players',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'COMMON.PLAYERS' | translate }}</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all registered players.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
           <input type="text" [(ngModel)]="filters.name" placeholder="{{ 'COMMON.SEARCH' | translate }}..." 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
        </div>
        <div>
           <select [(ngModel)]="filters.role" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2">
             <option value="">All Roles</option>
             <option value="admin">Admin</option>
             <option value="editor">Editor</option>
             <option value="player">Player</option>
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
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">User</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Role</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Wins</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  @for (player of filteredPlayers(); track player.uid) {
                      <tr>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                            <div class="flex items-center">
                                <div class="h-10 w-10 flex-shrink-0">
                                    <img class="h-10 w-10 rounded-full" [src]="player.photoURL" alt="">
                                </div>
                                <div class="ml-4">
                                    <div class="font-medium text-gray-900 dark:text-white">{{ player.username }}</div>
                                    <div class="text-gray-500 dark:text-gray-400">{{ player.email }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
                                  [class.bg-red-100]="player.role === 'admin'"
                                  [class.text-red-800]="player.role === 'admin'"
                                  [class.bg-blue-100]="player.role === 'editor'"
                                  [class.text-blue-800]="player.role === 'editor'">
                              {{ player.role | uppercase }}
                            </span>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ player.gamesWon }}</td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="openEdit(player)" aria-label="Edit" title="Edit" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h6M5 12l7-7 7 7v6a2 2 0 01-2 2h-4l-8-8z" />
                              </svg>
                              <span class="sr-only">Edit</span>
                          </button>
                           <button (click)="deletePlayer(player.uid)" aria-label="Delete" title="Delete" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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

    <!-- Edit Modal -->
    @if (showModal) {
         <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                 <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Edit Player Role</h3>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                            <select [(ngModel)]="currentPlayer.role" class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="player">Player</option>
                            </select>
                        </div>
                    </div>
                     <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button type="button" (click)="savePlayer()"
                        class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
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
export class PlayersListComponent {
    playerService = inject(PlayerService);
    players = signal<Player[]>([]);

    filters = {
        name: '',
        role: ''
    };

    showModal = false;
    currentPlayer: Partial<Player> = {};

    constructor() {
        this.playerService.getPlayers().subscribe(p => this.players.set(p));
    }

    filteredPlayers() {
        return this.players().filter(p => {
            const matchesName = !this.filters.name || p.username.toLowerCase().includes(this.filters.name.toLowerCase());
            const matchesRole = !this.filters.role || p.role === this.filters.role;
            return matchesName && matchesRole;
        });
    }

    openEdit(player: Player) {
        this.currentPlayer = { ...player };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.currentPlayer = {};
    }

    async savePlayer() {
        if (this.currentPlayer.uid && this.currentPlayer.role) {
            await this.playerService.updatePlayer(this.currentPlayer.uid, { role: this.currentPlayer.role });
        }
        this.closeModal();
    }

    async deletePlayer(uid: string) {
        if (confirm('Are you sure you want to delete this player?')) {
            await this.playerService.deletePlayer(uid);
        }
    }
}
