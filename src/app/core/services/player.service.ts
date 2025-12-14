import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private firestore = inject(Firestore);
    private playersCollection = collection(this.firestore, 'players');

    getPlayers(): Observable<Player[]> {
        return collectionData(this.playersCollection) as Observable<Player[]>;
    }

    async updatePlayer(uid: string, data: Partial<Player>) {
        const docRef = doc(this.firestore, 'players', uid);
        return updateDoc(docRef, data);
    }

    async deletePlayer(uid: string) {
        const docRef = doc(this.firestore, 'players', uid);
        return deleteDoc(docRef);
    }
}
