import { useEffect, useState } from 'react';
import { Book, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudyPlanner } from '../context/StudyPlannerContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const dummyData: ExamSchedule[] = [
                {
                    subject: "Database Management",
                    date: new Date(2025, 5, 25),
                    duration: "3 hours",
                    difficulty: 3
                },
                {
                    subject: "Data Structures",
                    date: new Date(2025, 5, 28),
                    duration: "3 hours",
                    difficulty: 4
                },
                {
                    subject: "Web Development",
                    date: new Date(2025, 6, 2),
                    duration: "2.5 hours",
                    difficulty: 2
                },
                {
                    subject: "Operating Systems",
                    date: new Date(2025, 6, 5),
                    duration: "3 hours",
                    difficulty: 4
                },
                {
                    subject: "Computer Networks",
                    date: new Date(2025, 6, 8),
                    duration: "3 hours",
                    difficulty: 3
                }
            ];

export default function ExamScheduleComponent() {
    const navigate = useNavigate();
    const { examSchedule, setExamSchedule } = useStudyPlanner();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setExamSchedule(dummyData);
    });

    const handleExamScheduleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        setError('');

        const file = event.target.files?.[0];
        if (!file) return;

        try {
            let examData: ExamSchedule[] = [];
            
            if (file.name.endsWith('.csv')) {
                const text = await file.text();
                const result = Papa.parse(text, { header: true });
                examData = result.data.map((row: any) => ({
                    subject: row.subject,
                    date: new Date(row.date),
                    duration: row.duration,
                    difficulty: parseInt(row.difficulty) || 1
                }));
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                examData = jsonData.map((row: any) => ({
                    subject: row.subject,
                    date: new Date(row.date),
                    duration: row.duration,
                    difficulty: parseInt(row.difficulty) || 1
                }));
            }

            setExamSchedule(examData);
        } catch (err) {
            setError('Error processing file. Please check the format.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDifficultyChange = (index: number, difficulty: number) => {
        const updatedExams = [...examSchedule];
        updatedExams[index] = {
            ...updatedExams[index],
            difficulty
        };
        setExamSchedule(updatedExams);
    };

    const handleNext = () => {
        navigate('/syllabus');
    };

    const calculateDaysRemaining = (examDate: Date): number => {
        const today = new Date();
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDaysDisplay = (days: number): string => {
        if (days < 0) return 'Expired';
        if (days > 10) return '9+ days';
        return `${days} days`;
    };

    const getDifficultyColor = (difficulty: number): string => {
        switch (difficulty) {
            case 1: return 'bg-green-100 text-green-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-orange-100 text-orange-800';
            case 4: return 'bg-red-100 text-red-800';
            case 5: return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Book className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Upload your exam schedule</span>
                        </p>
                        <p className="text-xs text-gray-500">CSV or Excel file (.xlsx, .xls)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleExamScheduleUpload}
                        accept=".csv,.xlsx,.xls"
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

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Exam Schedule</h3>
                </div>

                {examSchedule.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Remaining</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {examSchedule.map((exam, index) => {
                                    const daysRemaining = calculateDaysRemaining(exam.date);
                                    return (
                                        <tr key={index} className={daysRemaining < 0 ? 'bg-gray-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {exam.subject}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {exam.date.toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    daysRemaining < 0 ? 'bg-gray-100 text-gray-800' :
                                                    daysRemaining <= 3 ? 'bg-red-100 text-red-800' :
                                                    daysRemaining <= 7 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {getDaysDisplay(daysRemaining)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {exam.duration}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={exam.difficulty || 1}
                                                    onChange={(e) => handleDifficultyChange(index, Number(e.target.value))}
                                                    className={`rounded-md px-2 py-1 text-sm ${getDifficultyColor(exam.difficulty)}`}
                                                >
                                                    <option value={1}>Easy</option>
                                                    <option value={2}>Moderate</option>
                                                    <option value={3}>Intermediate</option>
                                                    <option value={4}>Hard</option>
                                                    <option value={5}>Very Hard</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No exam schedule data. Please upload your exam schedule.
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleNext}
                    disabled={examSchedule.length === 0 || isLoading}
                    className={`px-6 py-2 rounded-lg shadow-sm ${
                        examSchedule.length === 0 || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    Continue to Next Step
                </button>
            </div>
        </div>
    );
}