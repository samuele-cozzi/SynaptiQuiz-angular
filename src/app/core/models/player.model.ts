export type PlayerRole = 'admin' | 'editor' | 'player';

export interface Player {
    uid: string;
    username: string;
    photoURL?: string; // external url
    role: PlayerRole;
    gamesWon: number;
    email?: string; // Optional, from Google auth
    createdAt: Date;
    lastLogin: Date;
}
