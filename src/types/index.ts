// filepath: d:\Work Space\Frontend\study-planner\src\types\index.ts
export interface DailySchedule {
    day: string;
    sleepHours: number;
    collegeHours: number;
    availableHours: number;
}

export interface ExamSchedule {
    subject: string;
    date: Date;
    duration: string;
    difficulty: number;
}

export interface Subject {
    name: string;
    topics: string[];
    priority: number;
    examDate: Date | null;
    difficulty: number;
    lengthLevel: 'Brief' | 'Moderate' | 'Extensive';
    allocatedHours: number;
}

export interface StudyPlannerState {
    dailySchedule: DailySchedule[];
    examSchedule: ExamSchedule[];
    subjects: Subject[];
    totalWeeklyHours: number;
    currentStep: number;
}