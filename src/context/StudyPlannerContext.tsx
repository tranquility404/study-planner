import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Subject, ExamSchedule, AvailableTimeSlot, DailySchedule } from '../types';

interface StudyPlannerState {
    subjects: Subject[];
    examSchedule: ExamSchedule[];
    weeklySchedule: DailySchedule[];
    availableTimeSlots: AvailableTimeSlot[];
    totalWeeklyHours: number;
}

interface StudyPlannerContextType extends StudyPlannerState {
    setSubjects: (subjects: Subject[]) => void;
    setExamSchedule: (schedule: ExamSchedule[]) => void;
    setWeeklySchedule: (schedule: DailySchedule[]) => void;
    setAvailableTimeSlots: (slots: AvailableTimeSlot[]) => void;
    setTotalWeeklyHours: (hours: number) => void;
    resetState: () => void;
}

const initialState: StudyPlannerState = {
    subjects: [],
    examSchedule: [],
    weeklySchedule: [],
    availableTimeSlots: [],
    totalWeeklyHours: 0
};

const StudyPlannerContext = createContext<StudyPlannerContextType | undefined>(undefined);

export const StudyPlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [examSchedule, setExamSchedule] = useState<ExamSchedule[]>([]);
    const [weeklySchedule, setWeeklySchedule] = useState<DailySchedule[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
    const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);

    const resetState = () => {
        setSubjects([]);
        setExamSchedule([]);
        setWeeklySchedule([]);
        setAvailableTimeSlots([]);
        setTotalWeeklyHours(0);
    };

    const value = {
        subjects,
        examSchedule,
        weeklySchedule,
        availableTimeSlots,
        totalWeeklyHours,
        setSubjects,
        setExamSchedule,
        setWeeklySchedule,
        setAvailableTimeSlots,
        setTotalWeeklyHours,
        resetState
    };

    return (
        <StudyPlannerContext.Provider value={value}>
            {children}
        </StudyPlannerContext.Provider>
    );
};

export const useStudyPlanner = () => {
    const context = useContext(StudyPlannerContext);
    if (!context) {
        throw new Error('useStudyPlanner must be used within a StudyPlannerProvider');
    }
    return context;
};