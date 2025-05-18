import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Book, School, Clock, CheckCircle, X, Edit, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';
import DailyHoursCalculator from './components/DailyHoursCalculator';
import ExamScheduleComponent from './components/ExamSchedule';
import SyllabusInput from './components/SyllabusInput';
import PriorityAllocation from './components/PriorityAllocation';
import { useNavigate } from 'react-router-dom';

// Define TypeScript interfaces
interface Subject {
    name: string;
    topics: string[];
    priority: number;
    examDate: Date | null;
    estimatedHours: number;
}

interface ExamSchedule {
    subject: string;
    date: Date;
    duration: string;
    difficulty: number;
}

interface AvailableTimeSlot {
    day: string;
    startTime: string;
    endTime: string;
    duration: number;
}

interface DailySchedule {
    day: string;
    sleepHours: number;
    collegeHours: number;
    availableHours: number;
}
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

// Main component
export default function SmartTimetableApp() {
    const navigate = useNavigate();

    // State for the multi-step form
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // State for uploaded data
    const [timetableData, setTimetableData] = useState<AvailableTimeSlot[]>([]);
    const [examData, setExamData] = useState<ExamSchedule[]>(dummyData);
    const [syllabusData, setSyllabusData] = useState<Subject[]>([]);
    const [availableHours, setAvailableHours] = useState(0);
    const [weeklySchedule, setWeeklySchedule] = useState<DailySchedule[]>([]);

    // State for timetable generation
    const [generatedTimetable, setGeneratedTimetable] = useState<any>(null);

    // Calculate available hours when timetable data changes
    useEffect(() => {
        if (timetableData.length > 0) {
            const totalHours = timetableData.reduce((sum, slot) => sum + slot.duration, 0);
            setAvailableHours(totalHours);
        }
    }, [timetableData]);

    // File upload handlers
    const handleTimetableUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);

        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Determine file type and process accordingly
            if (file.name.endsWith('.csv')) {
                processCSVTimetable(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processExcelTimetable(file);
            } else {
                alert('Please upload a CSV or Excel file for the timetable');
            }
        } catch (error) {
            console.error('Error processing timetable:', error);
            alert('Failed to process timetable file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExamScheduleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);

        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Process exam schedule data
            if (file.name.endsWith('.csv')) {
                processCSVExamSchedule(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processExcelExamSchedule(file);
            } else {
                alert('Please upload a CSV or Excel file for the exam schedule');
            }
        } catch (error) {
            console.error('Error processing exam schedule:', error);
            alert('Failed to process exam schedule file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyllabusUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);

        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Process syllabus data
            if (file.name.endsWith('.docx')) {
                processSyllabusDocx(file);
            } else if (file.name.endsWith('.pdf')) {
                // For demo, we'll generate mock data instead of actual PDF parsing
                processMockSyllabus();
            } else if (file.name.endsWith('.txt')) {
                processSyllabusTxt(file);
            } else {
                alert('Please upload a DOCX, PDF, or TXT file for the syllabus');
            }
        } catch (error) {
            console.error('Error processing syllabus:', error);
            alert('Failed to process syllabus file');
        } finally {
            setIsLoading(false);
        }
    };

    // File processing methods
    const processCSVTimetable = (file: File) => {
        Papa.parse(file, {
            header: true,
            complete: (results: any) => {
                // Convert the CSV data to our timetable format
                const slots: AvailableTimeSlot[] = [];

                results.data.forEach((row: any) => {
                    if (row.day && row.startTime && row.endTime) {
                        // Calculate duration in hours
                        const start = new Date(`1970-01-01T${row.startTime}`);
                        const end = new Date(`1970-01-01T${row.endTime}`);
                        const durationMs = end.getTime() - start.getTime();
                        const durationHours = durationMs / (1000 * 60 * 60);

                        slots.push({
                            day: row.day,
                            startTime: row.startTime,
                            endTime: row.endTime,
                            duration: durationHours
                        });
                    }
                });

                setTimetableData(slots);
            },
            error: (error: any) => {
                console.error('Error parsing CSV:', error);
                alert('Failed to parse CSV file');
            }
        });
    };

    const processExcelTimetable = async (file: File) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const slots: AvailableTimeSlot[] = [];

        jsonData.forEach((row: any) => {
            if (row.day && row.startTime && row.endTime) {
                // Calculate duration in hours
                const start = new Date(`1970-01-01T${row.startTime}`);
                const end = new Date(`1970-01-01T${row.endTime}`);
                const durationMs = end.getTime() - start.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);

                slots.push({
                    day: row.day,
                    startTime: row.startTime,
                    endTime: row.endTime,
                    duration: durationHours
                });
            }
        });

        setTimetableData(slots);
    };

    const processCSVExamSchedule = (file: File) => {
        Papa.parse(file, {
            header: true,
            complete: (results: any) => {
                const exams: ExamSchedule[] = [];

                results.data.forEach((row: any) => {
                    if (row.subject && row.date) {
                        exams.push({
                            subject: row.subject,
                            date: new Date(row.date),
                            duration: row.duration || '3 hours',
                            difficulty: row.difficulty || 1
                        });
                    }
                });

                // Sort exams by date
                exams.sort((a, b) => a.date.getTime() - b.date.getTime());
                setExamData(exams);
            },
            error: (error: any) => {
                console.error('Error parsing CSV:', error);
                alert('Failed to parse CSV file');
            }
        });
    };

    const processExcelExamSchedule = async (file: File) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const exams: ExamSchedule[] = [];

        jsonData.forEach((row: any) => {
            if (row.subject && row.date) {
                exams.push({
                    subject: row.subject,
                    date: new Date(row.date),
                    duration: row.duration || '3 hours',
                    difficulty: row.difficulty || 1
                });
            }
        });

        // Sort exams by date
        exams.sort((a, b) => a.date.getTime() - b.date.getTime());
        setExamData(exams);
    };

    const processSyllabusDocx = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        // Simple parsing logic for demonstration
        // In a real app, this would be much more sophisticated
        const subjects: Subject[] = [];
        const subjectBlocks = text.split(/\n{2,}/);

        subjectBlocks.forEach((block, index) => {
            const lines = block.split('\n');
            if (lines.length >= 2) {
                const name = lines[0].trim();
                const topics = lines.slice(1).filter(line => line.trim().length > 0);

                // Find matching exam date if available
                const matchingExam = examData.find(exam =>
                    exam.subject.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(exam.subject.toLowerCase())
                );

                subjects.push({
                    name,
                    topics,
                    priority: subjectBlocks.length - index, // Higher priority for subjects listed first
                    examDate: matchingExam?.date || null,
                    estimatedHours: topics.length * 2 // Simple estimate: 2 hours per topic
                });
            }
        });

        setSyllabusData(subjects);
    };

    const processSyllabusTxt = async (file: File) => {
        const text = await file.text();

        // Simple parsing logic for demonstration
        const subjects: Subject[] = [];
        const subjectBlocks = text.split(/\n{2,}/);

        subjectBlocks.forEach((block, index) => {
            const lines = block.split('\n');
            if (lines.length >= 2) {
                const name = lines[0].trim();
                const topics = lines.slice(1).filter(line => line.trim().length > 0);

                // Find matching exam date if available
                const matchingExam = examData.find(exam =>
                    exam.subject.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(exam.subject.toLowerCase())
                );

                subjects.push({
                    name,
                    topics,
                    priority: subjectBlocks.length - index, // Higher priority for subjects listed first
                    examDate: matchingExam?.date || null,
                    estimatedHours: topics.length * 2 // Simple estimate: 2 hours per topic
                });
            }
        });

        setSyllabusData(subjects);
    };

    // For demo purposes when PDF is uploaded (since we can't parse PDFs)
    const processMockSyllabus = () => {
        // Create mock data for demonstration
        const subjects: Subject[] = [
            {
                name: "Computer Science",
                topics: ["Algorithms", "Data Structures", "Databases", "Operating Systems", "Computer Networks"],
                priority: 3,
                examDate: examData.find(exam => exam.subject.includes("Computer"))?.date || null,
                estimatedHours: 10
            },
            {
                name: "Mathematics",
                topics: ["Calculus", "Linear Algebra", "Probability", "Statistics", "Discrete Mathematics"],
                priority: 2,
                examDate: examData.find(exam => exam.subject.includes("Math"))?.date || null,
                estimatedHours: 15
            },
            {
                name: "Physics",
                topics: ["Mechanics", "Electricity", "Magnetism", "Optics", "Thermodynamics"],
                priority: 1,
                examDate: examData.find(exam => exam.subject.includes("Physics"))?.date || null,
                estimatedHours: 12
            }
        ];

        setSyllabusData(subjects);
    };

    // Subject priority handlers
    const increaseSubjectPriority = (index: number) => {
        if (index <= 0) return;

        const newSyllabusData = [...syllabusData];
        const temp = newSyllabusData[index];
        newSyllabusData[index] = newSyllabusData[index - 1];
        newSyllabusData[index - 1] = temp;

        // Update priority values
        newSyllabusData[index].priority -= 1;
        newSyllabusData[index - 1].priority += 1;

        setSyllabusData(newSyllabusData);
    };

    const decreaseSubjectPriority = (index: number) => {
        if (index >= syllabusData.length - 1) return;

        const newSyllabusData = [...syllabusData];
        const temp = newSyllabusData[index];
        newSyllabusData[index] = newSyllabusData[index + 1];
        newSyllabusData[index + 1] = temp;

        // Update priority values
        newSyllabusData[index].priority += 1;
        newSyllabusData[index + 1].priority -= 1;

        setSyllabusData(newSyllabusData);
    };

    // Methods to edit extracted data
    const addTimeSlot = () => {
        setTimetableData([
            ...timetableData,
            {
                day: "Monday",
                startTime: "09:00",
                endTime: "10:00",
                duration: 1
            }
        ]);
    };

    const updateTimeSlot = (index: number, field: keyof AvailableTimeSlot, value: string | number) => {
        const newTimetableData = [...timetableData];

        if (field === 'duration') {
            newTimetableData[index][field] = value as number;
        } else {
            newTimetableData[index][field] = value as string;

            // Recalculate duration if start or end time changed
            if (field === 'startTime' || field === 'endTime') {
                const start = new Date(`1970-01-01T${newTimetableData[index].startTime}`);
                const end = new Date(`1970-01-01T${newTimetableData[index].endTime}`);
                const durationMs = end.getTime() - start.getTime();
                const durationHours = durationMs / (1000 * 60 * 60);
                newTimetableData[index].duration = durationHours > 0 ? durationHours : 0;
            }
        }

        setTimetableData(newTimetableData);
    };

    const removeTimeSlot = (index: number) => {
        setTimetableData(timetableData.filter((_, i) => i !== index));
    };

    const updateSubjectHours = (index: number, hours: number) => {
        const newSyllabusData = [...syllabusData];
        newSyllabusData[index].estimatedHours = hours;
        setSyllabusData(newSyllabusData);
    };

    const handleDifficultyChange = (index: number, difficulty: number) => {
        const updatedExams = [...examData];
        updatedExams[index] = { ...updatedExams[index], difficulty };
        setExamData(updatedExams);
    };

    // Generate the timetable
    const generateTimetable = () => {
        setIsGenerating(true);

        // Simulate timetable generation with a delay
        setTimeout(() => {
            // Sort subjects by exam date and priority
            const sortedSubjects = [...syllabusData].sort((a, b) => {
                // First sort by exam date
                if (a.examDate && b.examDate) {
                    return a.examDate.getTime() - b.examDate.getTime();
                } else if (a.examDate) {
                    return -1;
                } else if (b.examDate) {
                    return 1;
                }

                // Then by priority
                return a.priority - b.priority;
            });

            // Allocate time slots to subjects
            const timetableAllocation = {};
            let availableSlots = [...timetableData];

            sortedSubjects.forEach(subject => {
                // Calculate how many hours needed for this subject
                let hoursNeeded = subject.estimatedHours;
                let allocatedSlots = [];

                // Allocate slots until we've covered the needed hours
                while (hoursNeeded > 0 && availableSlots.length > 0) {
                    // Take the first available slot
                    const slot = availableSlots[0];

                    if (slot.duration <= hoursNeeded) {
                        // Use the entire slot
                        allocatedSlots.push({ ...slot });
                        hoursNeeded -= slot.duration;
                        availableSlots.shift();
                    } else {
                        // Use part of the slot
                        const allocatedDuration = hoursNeeded;

                        // Calculate new end time
                        const startTime = new Date(`1970-01-01T${slot.startTime}`);
                        const endTimeMs = startTime.getTime() + (hoursNeeded * 60 * 60 * 1000);
                        const endTime = new Date(endTimeMs);
                        const formattedEndTime = endTime.toTimeString().substring(0, 5);

                        // Add the allocated portion
                        allocatedSlots.push({
                            day: slot.day,
                            startTime: slot.startTime,
                            endTime: formattedEndTime,
                            duration: allocatedDuration
                        });

                        // Update the remaining slot
                        availableSlots[0] = {
                            day: slot.day,
                            startTime: formattedEndTime,
                            endTime: slot.endTime,
                            duration: slot.duration - allocatedDuration
                        };

                        hoursNeeded = 0;
                    }
                }

                // Add the allocation to the timetable
                timetableAllocation[subject.name] = {
                    subject,
                    allocatedSlots,
                    totalHours: subject.estimatedHours - hoursNeeded, // How many hours we managed to allocate
                    remainingHours: hoursNeeded // How many hours are still needed
                };
            });

            setGeneratedTimetable(timetableAllocation);
            setIsGenerating(false);
            navigate('/timetable', { 
                state: { 
                    timetableData: timetableAllocation,
                    subjects: syllabusData,
                    weeklySchedule: weeklySchedule
                } 
            });
        }, 3000);
    };

    const handleWeeklyScheduleNext = (schedule: DailySchedule[]) => {
        setWeeklySchedule(schedule);
        setCurrentStep(2); // Move to the next step
    };

    const handleGenerateSchedule = (event: any) => {
                    
    }

    // UI rendering based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <DailyHoursCalculator onNext={handleWeeklyScheduleNext} />;

            case 2:
                return <ExamScheduleComponent
                        examData={examData}
                        onExamScheduleUpload={handleExamScheduleUpload}
                        onNext={() => setCurrentStep(3)}
                        isLoading={isLoading}
                        onDifficultyChange={handleDifficultyChange}
                    />
                
           case 3:
                return (
                    <SyllabusInput
                        onSubmit={(subjects) => {
                            setSyllabusData(subjects.map(subject => ({
                                ...subject,
                                priority: 1,
                                examDate: examData.find(exam => 
                                    exam.subject.toLowerCase() === subject.name.toLowerCase()
                                )?.date || null
                            })));
                            setCurrentStep(4);
                        }}
                        isLoading={isLoading}
                        examDates={Object.fromEntries(
                            examData.map(exam => [exam.subject, exam.date])
                        )}
                    />
                );

            case 4:
                return (
                    <PriorityAllocation
                        subjects={syllabusData.map(subject => ({
                            ...subject,
                            difficulty: examData.find(
                                exam => exam.subject.toLowerCase() === subject.name.toLowerCase()
                            )?.difficulty || 3,
                            lengthLevel: subject.topics.length <= 5 ? 'Brief' : 
                                       subject.topics.length <= 8 ? 'Moderate' : 'Extensive'
                        }))}
                        totalWeeklyHours={weeklySchedule.reduce((sum, day) => sum + day.availableHours, 0)}
                        onPriorityChange={(updatedSubjects) => {
                            setSyllabusData(updatedSubjects);
                        }}
                        onCreateTimetable={generateTimetable}
                    />
                );
        }
    }
    return renderStepContent();
}
