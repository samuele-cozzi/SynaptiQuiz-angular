export interface Answer {
    text: string;
    correct: boolean;
    plausibility?: number; // percentage
}

export interface Question {
    id: string;
    text: string;
    topicId: string; // Linking to Topic
    difficulty: number; // 1 to 5
    language: 'en' | 'it';
    answers: Answer[];
    createdAt: Date;
}
