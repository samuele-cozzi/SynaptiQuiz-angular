import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Topic } from '../models/topic.model';

@Injectable({
    providedIn: 'root'
})
export class TopicService {
    private firestore = inject(Firestore);
    private topicsCollection = collection(this.firestore, 'topics');

    getTopics(): Observable<Topic[]> {
        return collectionData(this.topicsCollection, { idField: 'id' }) as Observable<Topic[]>;
    }

    async addTopic(topic: Omit<Topic, 'id' | 'createdAt'>) {
        return addDoc(this.topicsCollection, {
            ...topic,
            createdAt: new Date()
        });
    }

    async updateTopic(id: string, topic: Partial<Topic>) {
        const docRef = doc(this.firestore, 'topics', id);
        return updateDoc(docRef, topic);
    }

    // Not explicitly requested but good to have
    async deleteTopic(id: string) {
        const docRef = doc(this.firestore, 'topics', id);
        return deleteDoc(docRef);
    }
}
