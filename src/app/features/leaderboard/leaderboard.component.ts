import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  Firestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from '@angular/fire/firestore';
import { Game } from '../../core/models/game.model';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {{ isGameSpecific ? 'Game Leaderboard' : 'Global Leaderboard' }}
      </h1>

      @if (isGameSpecific && gameData) {
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ gameData.name }}</h2>
        <p class="text-gray-500">Finished at: {{ gameData.completedAt | date : 'medium' }}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow scale-100 p-6 rounded-lg mb-8">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Results</h3>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (p of gamePlayers; track p.uid) {
          <li class="py-4 flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl font-bold text-gray-400 mr-4">#{{ $index + 1 }}</span>
              <img class="h-10 w-10 rounded-full" [src]="p.photoURL" alt="" />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ p.username }}</p>
              </div>
            </div>
            <div class="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {{ p.score }} pts
            </div>
          </li>
          }
        </ul>
      </div>

      <!-- Game Answers Review -->
      <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Questions Review</h3>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (ans of gameData.playerAnswers; track $index) {
          <li class="py-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Q: {{ getQuestionText(ans.questionId) }}
            </p>
            <div class="flex items-center text-sm">
              <span class="mr-2 text-gray-500">Player: {{ getPlayerName(ans.playerId) }}</span>
              <span
                class="mx-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                [class.bg-green-100]="ans.isCorrect"
                [class.text-green-800]="ans.isCorrect"
                [class.bg-red-100]="!ans.isCorrect"
                [class.text-red-800]="!ans.isCorrect"
              >
                {{ ans.isCorrect ? 'Correct' : 'Wrong' }}
              </span>
              <span class="text-gray-500" *ngIf="ans.points > 0">+{{ ans.points }} pts</span>
              <!-- <span class="ml-auto text-gray-500 text-xs">Correct Answer: {{ getCorrectAnswerText(ans.questionId) }}</span> -->
            </div>
          </li>
          }
        </ul>
      </div>

      } @else {
      <!-- Global Leaderboard -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Player
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Games Won
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            @for (p of globalPlayers; track p.uid) {
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{ $index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full" [src]="p.photoURL" alt="" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ p.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.gamesWon }}</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>
  `,
})
export class LeaderboardComponent implements OnInit {
  route = inject(ActivatedRoute);
  firestore = inject(Firestore);

  isGameSpecific = false;
  gameData: Game | null = null;
  gamePlayers: any[] = []; // Sorted by score

  globalPlayers: Player[] = [];

  constructor() {}

  async ngOnInit() {
    const gameId = this.route.snapshot.queryParamMap.get('gameId');
    if (gameId) {
      this.isGameSpecific = true;
      await this.loadGameData(gameId);
    } else {
      this.isGameSpecific = false;
      await this.loadGlobalData();
    }
  }

  async loadGameData(id: string) {
    const docRef = doc(this.firestore, 'games', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      this.gameData = snap.data() as Game;
      // Sort players by score
      this.gamePlayers = [...this.gameData.players].sort((a, b) => b.score - a.score);
    }
  }

  async loadGlobalData() {
    const colRef = collection(this.firestore, 'players');
    // Query "game wins against other players"?
    // Prompt says "Who guess more answers win the game".
    // "Player entity has: ... game wins".
    // We sort by game wins.
    const q = query(colRef, orderBy('gamesWon', 'desc'), limit(50));
    const snap = await getDocs(q);
    this.globalPlayers = snap.docs.map((d) => d.data() as Player);
  }

  getQuestionText(id: string) {
    return this.gameData?.questions.find((q) => q.id === id)?.text || 'Unknown';
  }

  getPlayerName(uid: string) {
    return this.gameData?.players.find((p) => p.uid === uid)?.username || 'Unknown';
  }

  getCorrectAnswerText(id: string) {
    const q = this.gameData?.questions.find((q) => q.id === id);
    return q?.answers.find((a) => a.correct)?.text || 'Unknown';
  }
}
