import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  Firestore,
  doc,
  docData,
  collection,
  query,
  orderBy,
  limit,
  collectionData,
} from '@angular/fire/firestore';
import { Game } from '../../core/models/game.model';
import { Player } from '../../core/models/player.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {{ isGameSpecific ? 'Game Leaderboard' : 'Global Leaderboard' }}
      </h1>

      @if (isGameSpecific && gameData()) {
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ gameData()!.name }}</h2>
        <p class="text-gray-500">Finished at: {{ toDate(gameData()!.completedAt) | date : 'medium' }}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow scale-100 p-6 rounded-lg mb-8">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Results</h3>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          @for (p of gamePlayers(); track p.uid) {
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
          @for (ans of gameData()!.playerAnswers; track $index) {
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

      } @else if (isGameSpecific && !gameData()) {
        <div class="text-center py-8">
          <p class="text-gray-500">Loading game data...</p>
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
                Games Played
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Games Won
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Points
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            @for (p of globalPlayers(); track p.uid) {
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.gamesPlayed || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">{{ p.gamesWon || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ p.totalPoints || 0 }}</td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>
  `,
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  firestore = inject(Firestore);

  isGameSpecific = false;
  gameData = signal<Game | null>(null);
  gamePlayers = signal<any[]>([]); // Sorted by score

  globalPlayers = signal<Player[]>([]);

  private gameSub?: Subscription;
  private playersSub?: Subscription;

  ngOnInit() {
    const gameId = this.route.snapshot.queryParamMap.get('gameId');
    if (gameId) {
      this.isGameSpecific = true;
      this.loadGameData(gameId);
    } else {
      this.isGameSpecific = false;
      this.loadGlobalData();
    }
  }

  ngOnDestroy() {
    this.gameSub?.unsubscribe();
    this.playersSub?.unsubscribe();
  }

  loadGameData(id: string) {
    const docRef = doc(this.firestore, 'games', id);
    // Use docData for real-time updates
    this.gameSub = docData(docRef, { idField: 'id' }).subscribe((data) => {
      if (data) {
        const game = data as Game;
        this.gameData.set(game);
        // Sort players by score whenever game data updates
        this.gamePlayers.set([...game.players].sort((a, b) => b.score - a.score));
      }
    });
  }

  loadGlobalData() {
    const colRef = collection(this.firestore, 'players');
    const q = query(colRef, orderBy('gamesWon', 'desc'), limit(50));
    // Use collectionData for real-time updates
    this.playersSub = collectionData(q, { idField: 'uid' }).subscribe((players) => {
      this.globalPlayers.set(players as Player[]);
    });
  }

  getQuestionText(id: string) {
    return this.gameData()?.questions.find((q) => q.id === id)?.text || 'Unknown';
  }

  getPlayerName(uid: string) {
    return this.gameData()?.players.find((p) => p.uid === uid)?.username || 'Unknown';
  }

  getCorrectAnswerText(id: string) {
    const q = this.gameData()?.questions.find((q) => q.id === id);
    return q?.answers.find((a) => a.correct)?.text || 'Unknown';
  }

  toDate(timestamp: any): Date {
    // Handle Firestore Timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // Handle already converted Date objects
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // Fallback to current date
    return new Date();
  }
}
