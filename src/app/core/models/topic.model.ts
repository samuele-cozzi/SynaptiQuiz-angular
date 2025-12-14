export interface Topic {
    id: string; // Firestore Doc ID
    text: string;
    imageUrl: string; // external url
    createdAt: Date;
}
