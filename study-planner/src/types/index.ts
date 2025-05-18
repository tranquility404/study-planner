export interface Subject {
    name: string;
    topics: string[];
    priority: number;
    examDate: Date | null;
    difficulty: number;
    lengthLevel: 'Brief' | 'Moderate' | 'Extensive';
    allocatedHours: number;
}