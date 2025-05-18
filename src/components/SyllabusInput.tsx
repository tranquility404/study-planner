import { useEffect, useState } from 'react';
import { School, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudyPlanner } from '../context/StudyPlannerContext';

interface Subject {
    name: string;
    topics: string[];
    lengthLevel: 'Brief' | 'Moderate' | 'Extensive';
    estimatedHours: number;
    examDate?: Date | null;
    difficulty?: number;
}

const DUMMY_SUBJECTS: Subject[] = [
    {
        name: "Database Management",
        topics: [
            "Introduction to DBMS",
            "Entity Relationship Model",
            "Normalization",
            "SQL Basics",
            "Transactions and Concurrency",
            "Indexing and Query Optimization"
        ],
        lengthLevel: "Moderate",
        estimatedHours: 12
    },
    {
        name: "Data Structures",
        topics: [
            "Arrays and Linked Lists",
            "Stacks and Queues",
            "Trees and Binary Trees",
            "Graphs",
            "Sorting Algorithms",
            "Searching Algorithms",
            "Hash Tables"
        ],
        lengthLevel: "Extensive",
        estimatedHours: 21
    },
    {
        name: "Web Development",
        topics: [
            "HTML and CSS",
            "JavaScript Basics",
            "DOM Manipulation",
            "React Components",
            "State Management"
        ],
        lengthLevel: "Brief",
        estimatedHours: 5
    },
    {
        name: "Operating Systems",
        topics: [
            "Process Management",
            "Memory Management",
            "File Systems",
            "Deadlocks",
            "CPU Scheduling",
            "Virtualization"
        ],
        lengthLevel: "Extensive",
        estimatedHours: 18
    },
    {
        name: "Computer Networks",
        topics: [
            "OSI Model",
            "TCP/IP Protocol",
            "Network Security",
            "Routing Algorithms",
            "Socket Programming"
        ],
        lengthLevel: "Moderate",
        estimatedHours: 10
    }
];

export default function SyllabusInput() {
    const navigate = useNavigate();
    const { subjects, setSubjects, examSchedule } = useStudyPlanner();
    const [isLoading, setIsLoading] = useState(false);
    // const [subjects, setSubjects] = useState<Subject[]>(state.subjects.length ? state.subjects : DUMMY_SUBJECTS);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setSubjects(DUMMY_SUBJECTS);
    }
    , []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            setError('');
            let extractedSubjects: Subject[] = [];

            // Your file processing logic here
            
            setSubjects(extractedSubjects);
        } catch (err) {
            setError('Error processing file. Please check the format.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSubjectLength = (index: number, length: 'Brief' | 'Moderate' | 'Extensive') => {
        const newSubjects = [...subjects];
        newSubjects[index].lengthLevel = length;
        
        const hoursPerTopic = {
            Brief: 1,
            Moderate: 2,
            Extensive: 3
        };
        
        // newSubjects[index].estimatedHours = 
        //     newSubjects[index].topics.length * hoursPerTopic[length];
        
        setSubjects(newSubjects);
    };

    const handleNext = () => {
        // Map exam dates from global state to subjects
        const subjectsWithExamDates = subjects.map(subject => {
            const examInfo = examSchedule.find(exam => 
                exam.subject.toLowerCase() === subject.name.toLowerCase()
            );
            
            return {
                ...subject,
                examDate: examInfo?.date || null,
                difficulty: examInfo?.difficulty || 3
            };
        });

        setSubjects(subjectsWithExamDates);
        navigate('/priority');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <School className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Upload your syllabus</span>
                        </p>
                        <p className="text-xs text-gray-500">Word, PDF, or text file</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".docx,.pdf,.txt"
                        disabled={isLoading}
                    />
                </label>
            </div>

            {error && (
                <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {subjects.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Subjects and Topics
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Topics
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Number of Topics
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject Length
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects.map((subject, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {subject.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <ul className="list-disc pl-5">
                                                {subject.topics.slice(0, 3).map((topic, i) => (
                                                    <li key={i}>{topic}</li>
                                                ))}
                                                {subject.topics.length > 3 && (
                                                    <li className="text-gray-400">
                                                        +{subject.topics.length - 3} more
                                                    </li>
                                                )}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {subject.topics.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={subject.lengthLevel}
                                                onChange={(e) => updateSubjectLength(index, e.target.value as any)}
                                                className="block w-full px-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                            >
                                                <option value="Brief">Brief</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Extensive">Extensive</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={subjects.length === 0 || isLoading}
                    className={`px-6 py-2 rounded-lg shadow-sm ${
                        subjects.length === 0 || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        'Start Creating Timetable'
                    )}
                </button>
            </div>
        </div>
    );
}