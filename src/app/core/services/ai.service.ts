import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question } from '../models/question.model';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    // TODO: Replace with your actual API key
    private readonly checkEnv = (window as any).GEMINI_API_KEY || 'AIzaSyBoz4aqY7j5Ct3AH6J2InUvYnhcDwzwPKk';
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(this.checkEnv);
    }

    async generateQuestions(topic: string, language: 'en' | 'it', difficulties: number[], countPerDifficulty: number): Promise<Partial<Question>[]> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Fallback to 1.5-flash as 2.5 is not standard yet

        const prompt = `
      Generate ${countPerDifficulty} quiz questions for EACH of the following difficulty levels: ${difficulties.join(', ')}.
      Topic: "${topic}".
      Language: "${language}".
      
      Total questions to generate: ${difficulties.length * countPerDifficulty}.
      
      Output strictly a JSON array of objects.
      Each object must match this interface:
      {
        "text": "Question text",
        "difficulty": number,
        "topicId": "ai-generated", 
        "language": "${language}",
        "answers": [
          { "text": "Answer 1", "correct": boolean },
          { "text": "Answer 2", "correct": boolean },
          { "text": "Answer 3", "correct": boolean },
          { "text": "Answer 4", "correct": boolean }
        ]
      }
      
      Ensure exactly one answer is correct per question.
      Do not include markdown formatting (like \`\`\`json). Just the raw JSON.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean up markdown if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText) as Partial<Question>[];
        } catch (error) {
            console.error('Error generating questions:', error);
            throw error;
        }
    }
}
