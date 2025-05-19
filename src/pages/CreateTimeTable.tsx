
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Clock, Calendar, BookOpen, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { generateTimetable } from '../api/apiRequests';

// Define types for our form data
type Subject = {
    id: string;
    name: string;
    difficultyLevel: 'Easy' | 'Moderate' | 'Hard';
    priority: number;
    dailyRevisionRequired: boolean;
};

type TimeBlock = {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    start: string;
    end: string;
};

type FormData = {
    timetableName: string;
    subjects: Subject[];
    preferredStudyTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Flexible';
    studyBlockDuration: number;
    breakDuration: number;
    dailyTargetStudyHours: number;
    offDay: 'Sunday' | 'Saturday' | 'None' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    availableBlocks: TimeBlock[];
};

export default function CreateTimeTable() {
    // Active section state (0: metadata, 1: subjects, 2: schedule)
    const [activeSection, setActiveSection] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showTimetable, setShowTimetable] = useState(false);
    const navigate = useNavigate();

    // Section collapsible states
    const [sections, setSections] = useState({
        metadata: true,
        subjects: true,
        schedule: true
    });

    // Define initial state for the form
    const [formData, setFormData] = useState<FormData>({
        timetableName: '',
        subjects: [{
            id: crypto.randomUUID(),
            name: '',
            difficultyLevel: 'Moderate',
            priority: 3,
            dailyRevisionRequired: false
        }],
        preferredStudyTime: 'Evening',
        studyBlockDuration: 50,
        breakDuration: 10,
        dailyTargetStudyHours: 4,
        offDay: 'Sunday',
        availableBlocks: [
            { day: 'Monday', start: '18:00', end: '22:00' },
            { day: 'Tuesday', start: '18:00', end: '22:00' },
            { day: 'Wednesday', start: '18:00', end: '22:00' },
            { day: 'Thursday', start: '18:00', end: '22:00' },
            { day: 'Friday', start: '18:00', end: '22:00' },
            { day: 'Saturday', start: '10:00', end: '17:00' },
            { day: 'Sunday', start: '10:00', end: '17:00' }
        ]
    });

    // Handle section navigation
    const navigateSection = (direction: 'next' | 'prev') => {
        setIsAnimating(true);
        setTimeout(() => {
            if (direction === 'next') {
                setActiveSection(prev => Math.min(prev + 1, 2));
            } else {
                setActiveSection(prev => Math.max(prev - 1, 0));
            }
            setIsAnimating(false);
        }, 300);
    };

    // Toggle section visibility
    const toggleSection = (section: keyof typeof sections) => {
        setSections({
            ...sections,
            [section]: !sections[section]
        });
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'number' ? Number(value) : value
        });
    };

    // Handle checkbox changes
    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        setFormData({
            ...formData,
            [name]: checked
        });
    };

    // Add a new subject
    const addSubject = () => {
        setFormData({
            ...formData,
            subjects: [
                ...formData.subjects,
                {
                    id: crypto.randomUUID(),
                    name: '',
                    difficultyLevel: 'Moderate',
                    priority: 3,
                    dailyRevisionRequired: false
                }
            ]
        });
    };

    // Remove a subject
    const removeSubject = (id: string) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.filter(subject => subject.id !== id)
        });
    };

    // Update a subject field
    const updateSubject = (id: string, field: string, value: any) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.map(subject =>
                subject.id === id ? { ...subject, [field]: value } : subject
            )
        });
    };

    // Add a new available time block
    const addAvailableBlock = () => {
        setFormData({
            ...formData,
            availableBlocks: [...formData.availableBlocks, { day: 'Monday', start: '', end: '' }]
        });
    };

    // Remove an available time block
    const removeAvailableBlock = (index: number) => {
        const updatedBlocks = [...formData.availableBlocks];
        updatedBlocks.splice(index, 1);
        setFormData({
            ...formData,
            availableBlocks: updatedBlocks
        });
    };

    // Update an available time block
    const handleBlockChange = (index: number, field: keyof TimeBlock, value: string) => {
        const updatedBlocks = [...formData.availableBlocks];
        updatedBlocks[index] = {
            ...updatedBlocks[index],
            [field]: value
        };
        setFormData({
            ...formData,
            availableBlocks: updatedBlocks
        });
    };

    // Handle drag and drop
    const handleDragEnd = (result, type) => {
        if (!result.destination) return;

        const items = Array.from(type === 'subjects' ? formData.subjects : formData.availableBlocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFormData({
            ...formData,
            [type === 'subjects' ? 'subjects' : 'availableBlocks']: items
        });
    };

    // Generate timetable
    // const generateTimetable = () => {
    //     setIsAnimating(true);
    //     setTimeout(() => {
    //         setShowTimetable(true);
    //         setIsAnimating(false);
    //     }, 500);
    // };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const jsonString = JSON.stringify(formData);
        console.log("Gathered data:", jsonString);
        const res = await generateTimetable(jsonString);
        console.log("Response from server:", res.data);
        navigate(`/timetable/${res.data["Mongodb_id"]}`);

        // setSchedule(res.data);

        // generateTimetable();
    };

    // Simple timetable representation
    const renderTimetable = () => {
        return (
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-indigo-700">{formData.timetableName || 'Your Study Timetable'}</h2>
                    <button 
                        onClick={() => {
                            setIsAnimating(true);
                            setTimeout(() => {
                                setShowTimetable(false);
                                setActiveSection(0);
                                setIsAnimating(false);
                            }, 300);
                        }}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                    >
                        Edit Timetable
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Schedule</h3>
                        <div className="grid grid-cols-7 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <div key={day} className={`p-3 rounded-md ${formData.offDay === day ? 'bg-gray-100' : 'bg-indigo-50'}`}>
                                    <h4 className="font-medium text-center mb-2">{day}</h4>
                                    {formData.offDay === day ? (
                                        <p className="text-sm text-center text-gray-500">Rest Day</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {formData.availableBlocks
                                                .filter(block => block.day === day)
                                                .map((block, idx) => (
                                                    <div key={idx} className="text-xs bg-white p-2 rounded border border-indigo-100">
                                                        <p className="text-center font-medium">{block.start} - {block.end}</p>
                                                        <div className="mt-1 divide-y divide-gray-100">
                                                            {formData.subjects.slice(0, 2).map((subject, i) => (
                                                                <p key={i} className="py-1 text-center">{subject.name || `Subject ${i+1}`}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Study Sessions</h3>
                        <div className="bg-indigo-50 p-3 rounded-md">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium">Study Block: {formData.studyBlockDuration} minutes</p>
                                    <p className="font-medium mt-2">Break Duration: {formData.breakDuration} minutes</p>
                                    <p className="font-medium mt-2">Daily Target: {formData.dailyTargetStudyHours} hours</p>
                                </div>
                                <div>
                                    <p className="font-medium">Preferred Time: {formData.preferredStudyTime}</p>
                                    <p className="font-medium mt-2">Rest Day: {formData.offDay === 'None' ? 'No Rest Day' : formData.offDay}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Subjects Priority</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {formData.subjects.map((subject, index) => (
                                <div key={subject.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-md">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
                                        ${subject.priority >= 4 ? 'bg-red-100 text-red-700' : 
                                        subject.priority >= 3 ? 'bg-orange-100 text-orange-700' :
                                        'bg-green-100 text-green-700'}`}>
                                        {subject.priority}
                                    </div>
                                    <div>
                                        <p className="font-medium">{subject.name || `Subject ${index + 1}`}</p>
                                        <p className="text-xs text-gray-500">{subject.difficultyLevel} • {subject.dailyRevisionRequired ? 'Daily Revision' : 'Normal Schedule'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render the form
    return (
        <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen flex items-center justify-center">
            {showTimetable ? (
                <div className={`w-full transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}`}>
                    {renderTimetable()}
                </div>
            ) : (
                <div className="w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-indigo-700">Create Your Study Timetable</h1>
                            <p className="text-gray-600 mt-1">Customize your perfect study schedule</p>
                            {/* Progress indicator */}
                            <div className="flex justify-center mt-4">
                                <div className="flex items-center">
                                    {[0, 1, 2].map((step) => (
                                        <div key={step} className="flex items-center">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsAnimating(true);
                                                    setTimeout(() => {
                                                        setActiveSection(step);
                                                        setIsAnimating(false);
                                                    }, 300);
                                                }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    activeSection === step
                                                        ? 'bg-indigo-600 text-white'
                                                        : activeSection > step
                                                        ? 'bg-indigo-200 text-indigo-700'
                                                        : 'bg-gray-200 text-gray-500'
                                                }`}
                                            >
                                                {activeSection > step ? <Check className="w-4 h-4" /> : step + 1}
                                            </button>
                                            {step < 2 && (
                                                <div className={`w-12 h-1 ${
                                                    activeSection > step ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sections Container with Animation */}
                        <div className="relative overflow-hidden">
                            <div className={`flex transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`} 
                                 style={{ transform: `translateX(-${activeSection * 100}%)` }}>
                                
                                {/* Timetable Metadata Section */}
                                <div className="min-w-full px-4">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div
                                            className="bg-indigo-50 p-3 flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleSection('metadata')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="text-indigo-600 w-4 h-4" />
                                                <h2 className="text-lg font-semibold text-indigo-700">Timetable Basics</h2>
                                            </div>
                                            {sections.metadata ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
                                        </div>

                                        {sections.metadata && (
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <label htmlFor="timetableName" className="block text-sm font-medium text-gray-700 mb-1">Timetable Name</label>
                                                    <input
                                                        type="text"
                                                        id="timetableName"
                                                        name="timetableName"
                                                        required
                                                        value={formData.timetableName}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="E.g., 'Final Exam Prep'"
                                                    />
                                                </div>
                                                <div className="pt-8 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigateSection('next')}
                                                        className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm font-medium flex items-center"
                                                    >
                                                        Next <ChevronRight className="ml-2 w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Subjects Section */}
                                <div className="min-w-full px-4">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div
                                            className="bg-indigo-50 p-3 flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleSection('subjects')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <BookOpen className="text-indigo-600 w-4 h-4" />
                                                <h2 className="text-lg font-semibold text-indigo-700">Subjects</h2>
                                            </div>
                                            {sections.subjects ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
                                        </div>

                                        {sections.subjects && (
                                            <div className="p-6 space-y-4">
                                                <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'subjects')}>
                                                    <Droppable droppableId="subjects">
                                                        {(provided) => (
                                                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                                                {formData.subjects.map((subject, index) => (
                                                                    <Draggable key={subject.id} draggableId={subject.id} index={index}>
                                                                        {(provided) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative mb-4 group"
                                                                            >
                                                                                <div className="absolute -right-2 -top-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeSubject(subject.id)}
                                                                                        className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-full"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                                
                                                                                <div className="flex items-center mb-4">
                                                                                    <div {...provided.dragHandleProps} className="mr-3 cursor-grab p-1 bg-gray-200 rounded">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                                                                            <line x1="8" y1="6" x2="21" y2="6" />
                                                                                            <line x1="8" y1="12" x2="21" y2="12" />
                                                                                            <line x1="8" y1="18" x2="21" y2="18" />
                                                                                            <line x1="3" y1="6" x2="3.01" y2="6" />
                                                                                            <line x1="3" y1="12" x2="3.01" y2="12" />
                                                                                            <line x1="3" y1="18" x2="3.01" y2="18" />
                                                                                        </svg>
                                                                                    </div>
                                                                                    <h3 className="font-medium text-gray-700">Subject {index + 1}</h3>
                                                                                </div>

                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                                    <div>
                                                                                        <label htmlFor={`subject-${subject.id}`} className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                                                                        <input
                                                                                            type="text"
                                                                                            id={`subject-${subject.id}`}
                                                                                            required
                                                                                            value={subject.name}
                                                                                            onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                                                            placeholder="E.g., Mathematics, Physics"
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <label htmlFor={`difficulty-${subject.id}`} className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                                                                                        <select
                                                                                            id={`difficulty-${subject.id}`}
                                                                                            value={subject.difficultyLevel}
                                                                                            onChange={(e) => updateSubject(subject.id, 'difficultyLevel', e.target.value)}
                                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                                                        >
                                                                                            <option value="Easy">Easy</option>
                                                                                            <option value="Moderate">Moderate</option>
                                                                                            <option value="Hard">Hard</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mb-4">
                                                                                    <label htmlFor={`priority-${subject.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                                                        Priority Level
                                                                                    </label>
                                                                                    <select
                                                                                        id={`priority-${subject.id}`}
                                                                                        value={subject.priority}
                                                                                        onChange={(e) => updateSubject(subject.id, 'priority', parseInt(e.target.value))}
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                                                    >
                                                                                        <option value="1">1 - Very Low</option>
                                                                                        <option value="2">2 - Low</option>
                                                                                        <option value="3">3 - Medium</option>
                                                                                        <option value="4">4 - High</option>
                                                                                        <option value="5">5 - Very High</option>
                                                                                    </select>
                                                                                </div>

                                                                                <div className="flex items-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={`revision-${subject.id}`}
                                                                                        checked={subject.dailyRevisionRequired}
                                                                                        onChange={(e) => updateSubject(subject.id, 'dailyRevisionRequired', e.target.checked)}
                                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                                    />
                                                                                    <label htmlFor={`revision-${subject.id}`} className="ml-2 text-sm text-gray-700">
                                                                                        Daily Revision Required
                                                                                    </label>
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
                                                <button
                                                    type="button"
                                                    onClick={addSubject}
                                                    className="w-full py-2 px-4 border border-dashed border-indigo-300 rounded-md text-indigo-600 hover:bg-indigo-50 flex items-center justify-center"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add Another Subject
                                                </button>
                                                
                                                <div className="pt-6 flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigateSection('prev')}
                                                        className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-sm font-medium flex items-center"
                                                    >
                                                        <ChevronLeft className="mr-2 w-4 h-4" /> Back
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigateSection('next')}
                                                        className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm font-medium flex items-center"
                                                    >
                                                        Next <ChevronRight className="ml-2 w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Schedule Settings */}
                                <div className="min-w-full px-4">
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div
                                            className="bg-indigo-50 p-3 flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleSection('schedule')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Clock className="text-indigo-600 w-4 h-4" />
                                                <h2 className="text-lg font-semibold text-indigo-700">Schedule Settings</h2>
                                            </div>
                                            {sections.schedule ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
                                        </div>

                                        {sections.schedule && (
                                            <div className="p-6 space-y-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Study Preferences</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                        <div>
                                                            <label htmlFor="preferredStudyTime" className="block text-sm font-medium text-gray-700 mb-1">Preferred Study Time</label>
                                                            <select
                                                                id="preferredStudyTime"
                                                                name="preferredStudyTime"
                                                                value={formData.preferredStudyTime}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                            >
                                                                <option value="Morning">Morning</option>
                                                                <option value="Afternoon">Afternoon</option>
                                                                <option value="Evening">Evening</option>
                                                                <option value="Night">Night</option>
                                                                <option value="Flexible">Flexible</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="dailyTargetStudyHours" className="block text-sm font-medium text-gray-700 mb-1">
                                                                Daily Target Study Hours
                                                            </label>
                                                            <input
                                                                type="number"
                                                                id="dailyTargetStudyHours"
                                                                name="dailyTargetStudyHours"
                                                                min="1"
                                                                max="10"
                                                                step="0.5"
                                                                required
                                                                value={formData.dailyTargetStudyHours}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label htmlFor="studyBlockDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                                                Study Session (min)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                id="studyBlockDuration"
                                                                name="studyBlockDuration"
                                                                min="15"
                                                                max="120"
                                                                required
                                                                value={formData.studyBlockDuration}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                                                Break Duration (min)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                id="breakDuration"
                                                                name="breakDuration"
                                                                min="5"
                                                                max="30"
                                                                required
                                                                value={formData.breakDuration}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="offDay" className="block text-sm font-medium text-gray-700 mb-1">Rest Day</label>
                                                            <select
                                                                id="offDay"
                                                                name="offDay"
                                                                value={formData.offDay}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                            >
                                                                <option value="None">No Rest Day</option>
                                                                <option value="Sunday">Sunday</option>
                                                                <option value="Monday">Monday</option>
                                                                <option value="Tuesday">Tuesday</option>
                                                                <option value="Wednesday">Wednesday</option>
                                                                <option value="Thursday">Thursday</option>
                                                                <option value="Friday">Friday</option>
                                                                <option value="Saturday">Saturday</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-4">Available Study Time Blocks</h3>
                                                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'timeBlocks')}>
                                                        <Droppable droppableId="timeBlocks">
                                                            {(provided) => (
                                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                                    {formData.availableBlocks.map((block, index) => (
                                                                        <Draggable key={`time-${index}`} draggableId={`time-${index}`} index={index}>
                                                                            {(provided) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg group relative"
                                                                                >
                                                                                    <div {...provided.dragHandleProps} className="cursor-grab p-1 bg-gray-200 rounded">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                                                                            <line x1="8" y1="6" x2="21" y2="6" />
                                                                                            <line x1="8" y1="12" x2="21" y2="12" />
                                                                                            <line x1="8" y1="18" x2="21" y2="18" />
                                                                                            <line x1="3" y1="6" x2="3.01" y2="6" />
                                                                                            <line x1="3" y1="12" x2="3.01" y2="12" />
                                                                                            <line x1="3" y1="18" x2="3.01" y2="18" />
                                                                                        </svg>
                                                                                    </div>
                                                                                    <select
                                                                                        value={block.day}
                                                                                        onChange={(e) => handleBlockChange(index, 'day', e.target.value)}
                                                                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 flex-1"
                                                                                    >
                                                                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                                                            <option key={day} value={day}>{day}</option>
                                                                                        ))}
                                                                                    </select>
                                                                                    <div className="flex items-center gap-2 flex-1">
                                                                                        <input
                                                                                            type="time"
                                                                                            value={block.start}
                                                                                            onChange={(e) => handleBlockChange(index, 'start', e.target.value)}
                                                                                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 flex-1"
                                                                                        />
                                                                                        <span className="text-gray-500">to</span>
                                                                                        <input
                                                                                            type="time"
                                                                                            value={block.end}
                                                                                            onChange={(e) => handleBlockChange(index, 'end', e.target.value)}
                                                                                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 flex-1"
                                                                                        />
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeAvailableBlock(index)}
                                                                                        className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-full"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </DragDropContext>
                                                    <button
                                                        type="button"
                                                        onClick={addAvailableBlock}
                                                        className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 py-2 px-4 rounded-md"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Available Time Block
                                                    </button>
                                                </div>
                                                
                                                <div className="pt-6 flex justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigateSection('prev')}
                                                        className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-sm font-medium flex items-center"
                                                    >
                                                        <ChevronLeft className="mr-2 w-4 h-4" /> Back
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm font-medium flex items-center"
                                                    >
                                                        Generate Timetable <ChevronRight className="ml-2 w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}