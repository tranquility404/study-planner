import React, { useState, useEffect } from 'react';
import { Subject } from '../types/index.ts';
import { useLocation } from 'react-router-dom';

interface TimeSlot {
    subject: Subject;
    startTime: string;
    endTime: string;
}

interface DaySchedule {
    day: string;
    slots: TimeSlot[];
}

interface TimetableProps {
    initialSubjects?: Subject[];
}

const generateWeeklySchedule = (subjects: Subject[]): DaySchedule[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dailySlots = ['09:00', '11:00', '14:00', '16:00'];
    
    return days.map(day => ({
        day,
        slots: subjects.map((subject, index) => ({
            subject,
            startTime: dailySlots[index % dailySlots.length],
            endTime: `${parseInt(dailySlots[index % dailySlots.length]) + 2}:00`
        })).slice(0, 3) // Limit to 3 subjects per day
    }));
};

const dummyData: Subject[] = [
    { 
        name: 'Mathematics', 
        topics: ['Algebra', 'Calculus'], 
        priority: 1, 
        examDate: new Date('2023-12-01'), 
        difficulty: 4, 
        lengthLevel: 'Moderate', 
        allocatedHours: 5 
    },
    { 
        name: 'Physics', 
        topics: ['Mechanics', 'Thermodynamics'], 
        priority: 2, 
        examDate: new Date('2023-12-10'), 
        difficulty: 3, 
        lengthLevel: 'Brief', 
        allocatedHours: 3 
    },
    { 
        name: 'Chemistry', 
        topics: ['Organic', 'Inorganic'], 
        priority: 3, 
        examDate: new Date('2023-12-15'), 
        difficulty: 5, 
        lengthLevel: 'Extensive', 
        allocatedHours: 4 
    }
];

const Timetable: React.FC<TimetableProps> = ({ initialSubjects }) => {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects || dummyData);
    const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);

    useEffect(() => {
        // Generate schedule whenever subjects change
        const schedule = generateWeeklySchedule(subjects);
        setWeeklySchedule(schedule);
    }, [subjects]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">Weekly Timetable</h2>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-5 gap-0.5 bg-gray-200">
                    {weeklySchedule.map(({ day, slots }) => (
                        <div key={day} className="bg-white">
                            <div className="bg-blue-50 p-3 text-center border-b">
                                <h3 className="font-semibold text-blue-800">{day}</h3>
                            </div>
                            <div className="divide-y">
                                {slots.map((slot, index) => (
                                    <div 
                                        key={index} 
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="font-medium text-gray-800">
                                            {slot.subject.name}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {slot.startTime} - {slot.endTime}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {slot.subject.topics.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3">Weekly Hours Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                    {subjects.map(subject => (
                        <div 
                            key={subject.name}
                            className="bg-gray-50 p-3 rounded-lg"
                        >
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-sm text-gray-600">
                                {subject.allocatedHours} hours/week
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timetable;