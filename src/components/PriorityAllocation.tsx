import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudyPlanner } from '../context/StudyPlannerContext';

interface Subject {
    name: string;
    topics: string[];
    priority: number;
    examDate: Date | null;
    difficulty: number;
    lengthLevel: 'Brief' | 'Moderate' | 'Extensive';
    allocatedHours: number;
}

const PriorityAllocation = () => {
    const navigate = useNavigate();
    const { totalWeeklyHours, subjects, setSubjects } = useStudyPlanner();

    const handleCreateTimetable = () => {
        navigate('/timetable');
    };

    // const [subjects, setSubjects] = useState<Subject[]>([]);
    const [error, setError] = useState<string>('');
    const [remainingHours, setRemainingHours] = useState(totalWeeklyHours);

    useEffect(() => {
        // Calculate initial priority scores and allocate hours
        const subjectsWithScores = calculatePriorityScores(subjects);
        const allocated = subjectsWithScores.map(subject => ({
        ...subject,
        allocatedHours: subject.allocatedHours || 0 // Ensure allocatedHours is initialized
    }));
        setSubjects(allocated);
        setRemainingHours(totalWeeklyHours);
    }, []);

    const calculatePriorityScores = (subjects: Subject[]) => {
        return subjects.map(subject => {
            // Calculate days until exam
            const daysUntilExam = subject.examDate 
                ? Math.ceil((subject.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 30;

            const lengthFactor = {
                'Brief': 1,
                'Moderate': 2,
                'Extensive': 3
            }[subject.lengthLevel];

            // Priority formula weights: difficulty (40%), length (30%), exam proximity (30%)
            const priorityScore = 
                (subject.difficulty * 0.4) + 
                (lengthFactor * 0.3) + 
                ((1 / daysUntilExam) * 30 * 0.3);

            return { ...subject, priorityScore };
        }).sort((a, b) => b.priorityScore - a.priorityScore);
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(subjects);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Recalculate hours based on new order
        const newSubjects = items.map((subject, index) => ({
            ...subject,
            priorityScore: items.length - index
        }));

        setSubjects(newSubjects);
    };

    const handleHourChange = (index: number, hours: number) => {
        const newSubjects = [...subjects];
        const oldHours = newSubjects[index].allocatedHours;
        const difference = hours - oldHours;
        
        // Check if we have enough remaining hours
        if (remainingHours - difference < 0) {
            setError("Not enough remaining hours available");
            return;
        }
        
        newSubjects[index].allocatedHours = hours;
        setSubjects(newSubjects);
        setRemainingHours(remainingHours - difference);
        setError(""); // Clear error if successful
    };

    const totalAllocatedHours = subjects.reduce((sum, subject) => sum + subject.allocatedHours, 0);
    const isValidAllocation = remainingHours >= 0 && totalAllocatedHours > 0;

    const HoursDisplay = () => (
        <div className="flex justify-between items-center mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-3 gap-8 w-full">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Total Weekly Hours</p>
                    <p className="text-2xl font-bold text-blue-600">{totalWeeklyHours}h</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Hours Allocated</p>
                    <p className="text-2xl font-bold text-green-600">{totalAllocatedHours}h</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Remaining Hours</p>
                    <p className={`text-2xl font-bold ${remainingHours >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {remainingHours}h
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Subject Priority & Time Allocation</h2>
                
                <HoursDisplay />
                
                {error && (
                    <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="subjects">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {subjects.map((subject, index) => (
                                    <Draggable key={subject.name} draggableId={subject.name} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">{subject.name}</h3>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {subject.examDate && (
                                                                <span className="mr-4">
                                                                    Exam: {subject.examDate.toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            <span className="mr-4">
                                                                Difficulty: {subject.difficulty}/5
                                                            </span>
                                                            <span>
                                                                Length: {subject.lengthLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max={totalWeeklyHours|100}
                                                            value={subject.allocatedHours}
                                                            onChange={(e) => handleHourChange(index, parseInt(e.target.value))}
                                                            className="w-32"
                                                        />
                                                        <span className="w-16 text-right">
                                                            {subject.allocatedHours}h
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleCreateTimetable}
                    disabled={!isValidAllocation}
                    className={`px-6 py-2 rounded-lg shadow-sm ${
                        !isValidAllocation
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    Create Timetable
                </button>
            </div>
        </div>
    );
};

export default PriorityAllocation;