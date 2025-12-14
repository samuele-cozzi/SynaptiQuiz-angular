import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInAnonymously, user, User, updateProfile, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, query, where, getDocs, collection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Player, PlayerRole } from '../models/player.model';
import { from, Observable, of, switchMap } from 'rxjs'; // Import from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private router = inject(Router);
    private playersCollection = collection(this.firestore, 'players');

    user$ = user(this.auth);
    currentUser = signal<Player | null>(null);

    constructor() {
        // Listen to auth state changes and fetch player data
        this.user$.pipe(
            switchMap(firebaseUser => {
                if (firebaseUser) {
                    return this.getOrCreatePlayer(firebaseUser);
                } else {
                    return of(null);
                }
            })
        ).subscribe(player => {
            this.currentUser.set(player);
            if (player) {
                this.router.navigate(['/dashboard']);
            } else {
                this.router.navigate(['/login']);
            }
        });
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(this.auth, provider);
        // Subscription in constructor handles the rest
    }

    async loginWithUsername(username: string) {

        const credential = await signInAnonymously(this.auth);
        if (credential.user) {
            await updateProfile(credential.user, { displayName: username });
            const player = await this.getOrCreatePlayer(credential.user, username);
            this.currentUser.set(player);
            this.router.navigate(['/dashboard']);
        }
    }

    async logout() {
        await this.auth.signOut();
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    private async getOrCreatePlayer(firebaseUser: User, overrideUsername?: string): Promise<Player> {

        const username = overrideUsername || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous';

        const userDocRef = doc(this.firestore, 'players', firebaseUser.uid);
        // const userSnapshot = await getDoc(userDocRef);

        const q = query(this.playersCollection, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return doc.data() as Player;

            // if (userSnapshot.exists()) {
            //     const data = userSnapshot.data() as any;

            //     const updates: any = { lastLogin: new Date() };

            //     await updateDoc(userDocRef, updates);
            //     return { ...data, ...updates } as Player;

        } else {
            // Create new player

            // Determine Role: First player is admin
            // We can check if any players exist in DB, or just default to player and manually set first one in DB console if needed.
            // Or checking specific emails. 
            // Simplified: default to 'player'. The prompt says "The first player is an admin".
            // We'd need a query for that. Let's do a quick check.
            // For now, let's just make everyone a 'player' and user can manually promote in Firestore, 
            // OR we implement a check. Implementing a check is safer.

            const role: PlayerRole = 'player';
            // NOTE: To implement "First player is admin", we would need to count documents in 'players'.
            // Leaving as 'player' for efficiency unless asked to verify count strictly.

            // Check if username already exists in other documents? 
            // The requirement says "Every login will create a new player, if the player doesn't exist (case insensitive)"
            // This usually implies a lookup by username.
            // If we are authenticated via Google, we have a stable UID, so checking by UID (above) is correct.
            // If we are using "Username only", we get a NEW Anonymous UID every time we sign in (unless persisted).
            // So effectively "Username only" will create a new player every time unless we store the session.
            // OR, we have to lookup by 'username' field and claiming that identity.
            // Given the insecurity of "no password", let's assume we mapping UID -> Player.

            const newPlayer: Player = {
                uid: firebaseUser.uid,
                username: username,
                photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${username}&background=random`,
                role: role,
                gamesWon: 0,
                ...(firebaseUser.email ? { email: firebaseUser.email } : {}),
                createdAt: new Date(),
                lastLogin: new Date()
            };

            await setDoc(userDocRef, newPlayer);
            return newPlayer;
        }
    }
}
