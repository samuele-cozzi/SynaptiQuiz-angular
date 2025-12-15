import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { QuestionService } from '../../core/services/question.service';
import { AuthService } from '../../core/services/auth.service';
import { TopicService } from '../../core/services/topic.service';
import { Player } from '../../core/models/player.model';
import { Question } from '../../core/models/question.model';
import { Game } from '../../core/models/game.model';
import { Topic } from '../../core/models/topic.model';

@Component({
  selector: 'app-game-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate"
          >
            {{ isDuplicate ? 'Duplicate Game' : ('COMMON.CREATE' | translate) }}
          </h2>
        </div>
      </div>

      <div class="mt-8 space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
        <!-- Step 1: Basic Info -->
        <div class="space-y-6 sm:space-y-5">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Basic Info</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Name and Language</p>
          </div>
          <div
            class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 dark:sm:border-gray-700 sm:pt-5"
          >
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
            >
              Name
            </label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                [(ngModel)]="gameData.name"
                class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              />
            </div>
          </div>
          <div
            class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 dark:sm:border-gray-700 sm:pt-5"
          >
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
            >
              Language
            </label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <select
                [(ngModel)]="gameData.language"
                (change)="onLanguageChange()"
                class="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              >
                <option value="en">English</option>
                <option value="it">Italian</option>
              </select>
              <p class="mt-2 text-sm text-gray-500">Changing language resets selected questions.</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Select Players -->
        <div class="pt-8 space-y-6 sm:space-y-5">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Select Players
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">Select at least one player.</p>
          </div>

          <div class="sm:flex sm:items-center">
            <input
              type="text"
              [(ngModel)]="playerSearch"
              placeholder="Filter players..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 max-w-xs"
            />
          </div>

          <!-- Players Grid -->
          <div
            class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-4"
          >
            @for (player of filteredPlayers(); track player.uid) {
            <div
              class="relative flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              (click)="togglePlayer(player)"
              [class.bg-indigo-50]="isSelectedPlayer(player.uid)"
              [class.dark:bg-indigo-900]="isSelectedPlayer(player.uid)"
            >
              <div class="flex items-center h-5">
                <input
                  type="checkbox"
                  [checked]="isSelectedPlayer(player.uid)"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded pointer-events-none"
                />
              </div>
              <div class="ml-3 text-sm">
                <label class="font-medium text-gray-700 dark:text-gray-200">{{
                  player.username
                }}</label>
              </div>
            </div>
            }
          </div>
          <p class="text-sm text-gray-500">Selected: {{ selectedPlayers().length }}</p>
        </div>

        <!-- Step 3: Select Questions -->
        <div class="pt-8 space-y-6 sm:space-y-5">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Select Questions
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Must assume even distribution (Divisible by {{ selectedPlayers().length || 'X' }}).
            </p>
          </div>

          <div class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            <input
              type="text"
              [(ngModel)]="questionSearch"
              placeholder="Search text..."
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            />
            
            <select
              [(ngModel)]="questionTopicId"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            >
              <option value="">All Topics</option>
              @for (topic of topics(); track topic.id) {
              <option [value]="topic.id">{{ topic.text }}</option>
              }
            </select>
            <select
              [(ngModel)]="questionDifficulty"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            >
              <option [ngValue]="null">All Difficulties</option>
              <option [ngValue]="1">1</option>
              <option [ngValue]="2">2</option>
              <option [ngValue]="3">3</option>
              <option [ngValue]="4">4</option>
              <option [ngValue]="5">5</option>
            </select>
          </div>

          <!-- Questions Grid -->
          <div
            class="grid grid-cols-1 gap-3 h-80 sm:h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-4"
          >
            @for (q of filteredQuestions(); track q.id) {
            <div
              class="relative flex items-start p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              (click)="toggleQuestion(q)"
              [class.bg-indigo-50]="isSelectedQuestion(q.id)"
              [class.dark:bg-indigo-900]="isSelectedQuestion(q.id)"
            >
              <div class="flex items-center h-5 mt-1">
                <input
                  type="checkbox"
                  [checked]="isSelectedQuestion(q.id)"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded pointer-events-none"
                />
              </div>
              <div class="ml-3 text-sm">
                <label class="font-medium text-gray-700 dark:text-gray-200">{{ q.text }}</label>
                <span
                  class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  Diff: {{ q.difficulty }}
                </span>
              </div>
            </div>
            }
          </div>
          <p
            class="text-sm"
            [class.text-red-600]="!isValidDistribution()"
            [class.text-green-600]="isValidDistribution()"
          >
            Selected: {{ selectedQuestions().length }} @if (selectedPlayers().length > 0) { (Per
            player: {{ selectedQuestions().length / selectedPlayers().length | number : '1.0-2' }})
            }
          </p>
          @if (!isValidDistribution() && selectedPlayers().length > 0) {
          <p class="text-sm text-red-600">
            Total questions must be divisible by number of players.
          </p>
          }
        </div>

        <div class="pt-5">
          <div class="flex justify-end">
            <a
              routerLink="/games"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500"
            >
              {{ 'COMMON.CANCEL' | translate }}
            </a>
            <button
              (click)="createGame()"
              [disabled]="!canCreate()"
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ 'COMMON.SAVE' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class GameCreateComponent implements OnInit {
  playerService = inject(PlayerService);
  questionService = inject(QuestionService);
  gameService = inject(GameService);
  authService = inject(AuthService);
  topicService = inject(TopicService);
  router = inject(Router);

  // Data
  allPlayers = signal<Player[]>([]);
  allQuestions = signal<Question[]>([]); // Filtered by language
  topics = signal<Topic[]>([]);

  // Selection
  selectedPlayers = signal<Player[]>([]);
  selectedQuestions = signal<Question[]>([]);

  // Form
  gameData = {
    name: '',
    language: (localStorage.getItem('language') as 'en' | 'it') || 'en',
  };

  // Filters
  playerSearch = '';
  questionSearch = '';
  questionDifficulty: number | null = null;
  questionTopicId = '';

  isDuplicate = false;

  constructor() {
    // Retrieve data
    this.playerService.getPlayers().subscribe((p) => this.allPlayers.set(p));
    this.topicService.getTopics().subscribe((t) => this.topics.set(t));
    this.fetchQuestions();
  }

  fetchQuestions() {
    this.questionService.getQuestionsByLanguage(this.gameData.language).subscribe((q) => {
      this.allQuestions.set(q);
      // If we had selected questions from a different language, they are invalid now (or we clear them).
      // For simplicity, we clear selection on language change unless it matches duplication logic.
      if (!this.isDuplicate) {
        this.selectedQuestions.set([]);
      } else {
        // If duplicating, we try to preserve selected questions if they exist in new list
        // But actually duplicate usually copies same language.
        // If user changes language while duplicating, questions become invalid.
        const currentIds = this.allQuestions().map((q) => q.id);
        const validSelected = this.selectedQuestions().filter((sq) => currentIds.includes(sq.id));
        this.selectedQuestions.set(validSelected);
      }
    });
  }

  ngOnInit() {
    // Check for duplication state
    const state = history.state as { duplicateGame: Game };
    if (state && state.duplicateGame) {
      const g = state.duplicateGame;
      this.isDuplicate = true;
      this.gameData.name = g.name + ' (Copy)';
      this.gameData.language = g.language;

      this.fetchQuestions(); // Refresh questions for this language

      // Preselect users: "the logged user will be preselected in the list of users."
      // So we discard original players? Or keep them + logged user?
      // Prompt: "The user can duplicate the game... and the logged user will be preselected in the list of users."
      // This phrasing is ambiguous. Does it mean ONLY the logged user is preselected, resetting others?
      // "Preselected in the list" implies we start with Logged User selected.
      // Usually duplication implies picking same questions.
      // I will select Logged User ONLY, as maybe I want to play same questions with new people.

      const currentUser = this.authService.currentUser();
      if (currentUser) {
        // We need full Player object. Wait for allPlayers to load or find it.
        // We can just trust allPlayers will eventually load.
        // We'll set a temporary check in specific effect or just wait.
        // Simplest: Just use ID for selection logic, but we store full object in signal.
        // Actually, let's keep it simple: duplicate questions, reset players to Current User.
        this.selectedQuestions.set(g.questions);

        // We can't set selectedPlayers easily until allPlayers loaded.
        // We will try in filteredPlayers or just rely on IDs mainly?
        // Let's rely on logic updates.

        // Wait for Players logic:
        this.playerService.getPlayers().subscribe((players) => {
          this.allPlayers.set(players);
          const me = players.find((p) => p.uid === currentUser.uid);
          if (me) {
            this.selectedPlayers.set([me]);
          }
        });
      }
    }
  }

  onLanguageChange() {
    this.fetchQuestions();
  }

  filteredPlayers() {
    return this.allPlayers().filter(
      (p) =>
        !this.playerSearch || p.username.toLowerCase().includes(this.playerSearch.toLowerCase())
    );
  }

  filteredQuestions() {
    return this.allQuestions().filter((q) => {
      const matchesText =
        !this.questionSearch || q.text.toLowerCase().includes(this.questionSearch.toLowerCase());
      const matchesDiff =
        this.questionDifficulty === null || q.difficulty === this.questionDifficulty;
      const matchesTopic = !this.questionTopicId || q.topicId === this.questionTopicId;
      return matchesText && matchesDiff && matchesTopic;
    });
  }

  togglePlayer(p: Player) {
    this.selectedPlayers.update((current) => {
      const exists = current.find((x) => x.uid === p.uid);
      if (exists) return current.filter((x) => x.uid !== p.uid);
      return [...current, p];
    });
  }

  isSelectedPlayer(uid: string) {
    return this.selectedPlayers().some((p) => p.uid === uid);
  }

  toggleQuestion(q: Question) {
    this.selectedQuestions.update((current) => {
      const exists = current.find((x) => x.id === q.id);
      if (exists) return current.filter((x) => x.id !== q.id);
      return [...current, q];
    });
  }

  isSelectedQuestion(id: string) {
    return this.selectedQuestions().some((q) => q.id === id);
  }

  isValidDistribution() {
    const pCount = this.selectedPlayers().length;
    const qCount = this.selectedQuestions().length;
    if (pCount === 0 || qCount === 0) return false;
    return qCount % pCount === 0;
  }

  canCreate() {
    return this.gameData.name && this.isValidDistribution();
  }

  async createGame() {
    if (!this.canCreate()) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const playersWithScore = this.selectedPlayers().map((p) => ({
      ...p,
      score: 0,
    }));

    await this.gameService.createGame({
      name: this.gameData.name,
      language: this.gameData.language,
      createdBy: currentUser.uid,
      players: playersWithScore,
      questions: this.selectedQuestions(),
    });

    this.router.navigate(['/games']);
  }
}
