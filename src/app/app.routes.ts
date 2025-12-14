import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OptionsComponent } from './features/options/options.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'options', component: OptionsComponent },
            {
                path: 'topics',
                loadComponent: () => import('./features/topics/topics-list.component').then(m => m.TopicsListComponent)
            },
            {
                path: 'questions',
                loadComponent: () => import('./features/questions/questions-list.component').then(m => m.QuestionsListComponent)
            },
            {
                path: 'players',
                loadComponent: () => import('./features/players/players-list.component').then(m => m.PlayersListComponent)
            },
            {
                path: 'games',
                loadComponent: () => import('./features/games/games-list.component').then(m => m.GamesListComponent)
            },
            {
                path: 'games/create',
                loadComponent: () => import('./features/games/game-create.component').then(m => m.GameCreateComponent)
            },
            {
                path: 'games/:id',
                loadComponent: () => import('./features/games/game-play.component').then(m => m.GamePlayComponent)
            },
            {
                path: 'leaderboard',
                loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
