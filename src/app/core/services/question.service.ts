import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';

@Injectable({
    providedIn: 'root'
})
export class QuestionService {
    private firestore = inject(Firestore);
    private questionsCollection = collection(this.firestore, 'questions');

    getQuestions(): Observable<Question[]> {
        return collectionData(this.questionsCollection, { idField: 'id' }) as Observable<Question[]>;
    }

    // Example of how we might filter server-side if needed, but client-side filter is fine for v1
    getQuestionsByLanguage(lang: 'en' | 'it'): Observable<Question[]> {
        const q = query(this.questionsCollection, where('language', '==', lang));
        return collectionData(q, { idField: 'id' }) as Observable<Question[]>;
    }

    async addQuestion(question: Omit<Question, 'id' | 'createdAt'>) {
        return addDoc(this.questionsCollection, {
            ...question,
            createdAt: new Date()
        });
    }

    async updateQuestion(id: string, question: Partial<Question>) {
        const docRef = doc(this.firestore, 'questions', id);
        return updateDoc(docRef, question);
    }

    async deleteQuestion(id: string) {
        const docRef = doc(this.firestore, 'questions', id);
        return deleteDoc(docRef);
    }
}
