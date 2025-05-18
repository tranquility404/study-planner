// filepath: d:\Work Space\Frontend\study-planner\src\components\Timetable.tsx
import React from 'react';
import { Subject } from '../types';

const dummyData: Subject[] = [
    { name: 'Mathematics', topics: ['Algebra', 'Calculus'], priority: 1, examDate: new Date('2023-12-01'), difficulty: 4, lengthLevel: 'Moderate', allocatedHours: 5 },
    { name: 'Physics', topics: ['Mechanics', 'Thermodynamics'], priority: 2, examDate: new Date('2023-12-10'), difficulty: 3, lengthLevel: 'Brief', allocatedHours: 3 },
    { name: 'Chemistry', topics: ['Organic', 'Inorganic'], priority: 3, examDate: new Date('2023-12-15'), difficulty: 5, lengthLevel: 'Extensive', allocatedHours: 4 },
];

const Timetable: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Timetable</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Subject</th>
                        <th className="py-2 px-4 border-b">Allocated Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {dummyData.map((subject) => (
                        <tr key={subject.name}>
                            <td className="py-2 px-4 border-b">{subject.name}</td>
                            <td className="py-2 px-4 border-b">{subject.allocatedHours}h</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Timetable;