import { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, Target, CheckSquare, ArrowRight, List, Award, Coffee, AlertCircle } from "lucide-react";

// Define TypeScript interfaces
interface Subject {
  id: string;
  name: string;
  priority: number;
  difficultyLevel: string;
  dailyRevisionRequired: boolean;
}

interface TimeBlock {
  day: string;
  start: string;
  end: string;
}

interface TimetableData {
  timetableName: string;
  subjects: Subject[];
  preferredStudyTime: string;
  studyBlockDuration: number;
  breakDuration: number;
  dailyTargetStudyHours: number;
  availableBlocks: TimeBlock[];
  offDay: string;
}

interface Session {
  subject?: string;
  break?: boolean;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  day: string;
  sessions: Session[];
}

// Utility function to convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Utility function to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

// Generate study sessions based on available blocks and preferences
const generateStudySessions = (data: TimetableData) => {
  const sessions = [];
  
  data.availableBlocks.forEach(block => {
    if (block.day === data.offDay) return;
    
    const startMinutes = timeToMinutes(block.start);
    const endMinutes = timeToMinutes(block.end);
    const totalBlockDuration = endMinutes - startMinutes;
    
    const totalSessionTime = data.studyBlockDuration + data.breakDuration;
    const possibleSessions = Math.floor(totalBlockDuration / totalSessionTime);
    
    for (let i = 0; i < possibleSessions; i++) {
      const sessionStart = startMinutes + i * totalSessionTime;
      const sessionEnd = sessionStart + data.studyBlockDuration;
      
      if (sessionEnd <= endMinutes) {
        sessions.push({
          day: block.day,
          start: minutesToTime(sessionStart),
          end: minutesToTime(sessionEnd),
          subject: data.subjects[0]?.name || "Study Session",
          isBreak: false
        });
        
        // Add break if it fits within the block
        const breakEnd = sessionEnd + data.breakDuration;
        if (breakEnd <= endMinutes && i < possibleSessions - 1) {
          sessions.push({
            day: block.day,
            start: minutesToTime(sessionEnd),
            end: minutesToTime(breakEnd),
            subject: "Break",
            isBreak: true
          });
        }
      }
    }
  });
  
  return sessions;
};

// Generate weekly goals based on user data
const generateWeeklyGoals = (data: TimetableData) => {
  const workDays = 7 - (data.offDay ? 1 : 0);
  const dailyHours = data.dailyTargetStudyHours;
  const weeklyHours = dailyHours * workDays;
  
  return [
    `Complete ${weeklyHours} hours of focused study this week`,
    `Master key concepts in ${data.subjects.map(s => s.name).join(", ")}`,
    `Review and revise notes from all completed sessions`,
    `Complete practice questions for each subject`
  ];
};

// Generate daily to-dos based on the day
const generateDailyTodos = (data: TimetableData, currentDay: string) => {
  const isOffDay = currentDay === data.offDay;
  
  if (isOffDay) {
    return [
      "Take a well-deserved rest day",
      "Briefly review this week's material (optional)",
      "Prepare study materials for tomorrow",
      "Set goals for the upcoming week"
    ];
  }
  
  return [
    `Complete ${data.dailyTargetStudyHours} hours of study today`,
    `Focus on ${data.subjects.map(s => s.name).join(", ")}`,
    "Take proper breaks between study sessions",
    "Review today's progress before sleeping"
  ];
};

// Utility function to calculate duration
const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  return end - start;
};

export default function Test2() {
  const [data] = useState<TimetableData>({
  "timetableName": "Mytimetable",
  "subjects": [
    {
      "id": "d1f554a7-22c4-41c5-947e-638339f827d1",
      "name": "Maths",
      "priority": 1,
      "difficultyLevel": "Moderate",
      "dailyRevisionRequired": true
    },
    {
      "id": "529cb4a5-bba2-4a6a-8d1e-4301983d12db",
      "name": "Physics",
      "priority": 3,
      "difficultyLevel": "Moderate",
      "dailyRevisionRequired": false
    },
    {
      "id": "c0fa5545-075e-4fa3-b4df-1673d669237c",
      "name": "Chemistry",
      "priority": 3,
      "difficultyLevel": "Hard",
      "dailyRevisionRequired": false
    },
    {
      "id": "a8e213a5-fd11-423c-a14f-de54a27ed089",
      "name": "English",
      "priority": 3,
      "difficultyLevel": "Moderate",
      "dailyRevisionRequired": false
    }
  ],
  "preferredStudyTime": "Evening",
  "studyBlockDuration": 50,
  "breakDuration": 10,
  "dailyTargetStudyHours": 4,
  "availableBlocks": [
    { "day": "Monday", "start": "18:00", "end": "22:00" },
    { "day": "Tuesday", "start": "18:00", "end": "22:00" },
    { "day": "Wednesday", "start": "18:00", "end": "22:00" },
    { "day": "Thursday", "start": "18:00", "end": "22:00" },
    { "day": "Friday", "start": "18:00", "end": "22:00" },
    { "day": "Saturday", "start": "10:00", "end": "17:00" },
    { "day": "Sunday", "start": "10:00", "end": "17:00" }
  ],
  "offDay": "Sunday"
}
);

  const [currentDay, setCurrentDay] = useState("Monday");
  const [activeTab, setActiveTab] = useState("timetable");
  const [schedule, setSchedule] = useState<DaySchedule[]>([
  {
    "day": "Monday",
    "sessions": [
      {
        "subject": "A",
        "startTime": "20:00",
        "endTime": "21:30"
      },
      {
        "break": true,
        "startTime": "21:30",
        "endTime": "21:50"
      },
      {
        "subject": "B",
        "startTime": "21:50",
        "endTime": "22:00"
      }
    ]
  },
  {
    "day": "Tuesday",
    "sessions": [
      {
        "subject": "C",
        "startTime": "20:00",
        "endTime": "21:30"
      },
      {
        "break": true,
        "startTime": "21:30",
        "endTime": "21:50"
      },
      {
        "subject": "D",
        "startTime": "21:50",
        "endTime": "22:00"
      }
    ]
  },
  {
    "day": "Wednesday",
    "sessions": [
      {
        "subject": "E",
        "startTime": "20:00",
        "endTime": "21:30"
      },
      {
        "break": true,
        "startTime": "21:30",
        "endTime": "21:50"
      },
      {
        "subject": "F",
        "startTime": "21:50",
        "endTime": "22:00"
      }
    ]
  },
  {
    "day": "Thursday",
    "sessions": [
      {
        "subject": "A",
        "startTime": "20:00",
        "endTime": "21:30"
      },
      {
        "break": true,
        "startTime": "21:30",
        "endTime": "21:50"
      },
      {
        "subject": "B",
        "startTime": "21:50",
        "endTime": "22:00"
      }
    ]
  },
  {
    "day": "Friday",
    "sessions": [
      {
        "subject": "C",
        "startTime": "20:00",
        "endTime": "21:30"
      },
      {
        "break": true,
        "startTime": "21:30",
        "endTime": "21:50"
      },
      {
        "subject": "D",
        "startTime": "21:50",
        "endTime": "22:00"
      }
    ]
  },
  {
    "day": "Saturday",
    "sessions": [
      {
        "subject": "E",
        "startTime": "20:00",
        "endTime": "21:30"
      },
      {
        "break": true,
        "startTime": "21:30",
        "endTime": "21:50"
      },
      {
        "subject": "F",
        "startTime": "21:50",
        "endTime": "22:00"
      }
    ]
  }
]);
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Generate study sessions
  const studySessions = generateStudySessions(data);
  
  // Get sessions for current day
  const todaySessions = studySessions.filter(session => session.day === currentDay);
  
  // Generate weekly goals
  const weeklyGoals = generateWeeklyGoals(data);
  
  // Generate daily todos
  const dailyTodos = generateDailyTodos(data, currentDay);

  // Set current day on component mount
  useEffect(() => {
    const today = new Date().getDay();
    const dayMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday"
    };
    setCurrentDay(dayMap[today as keyof typeof dayMap]);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <BookOpen className="mr-2" />
            {data.timetableName} Study Dashboard
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-indigo-100 flex items-center">
              <Calendar className="mr-1" size={18} />
              {currentDay}
            </span>
            <span className="text-indigo-100 flex items-center">
              <Clock className="mr-1" size={18} />
              {data.preferredStudyTime} Focus
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === "timetable"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Calendar className="mr-2" size={16} />
              Timetable
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === "goals"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Target className="mr-2" size={16} />
              Goals & Targets
            </button>
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === "todos"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CheckSquare className="mr-2" size={16} />
              Today's To-Do
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
        {activeTab === "timetable" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <Calendar className="mr-2" size={20} />
                Weekly Schedule
              </h2>
              
              {/* Day selector */}
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setCurrentDay(day)}
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                      currentDay === day
                        ? "bg-indigo-100 text-indigo-700"
                        : day === data.offDay
                        ? "bg-gray-100 text-gray-500"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {day}
                    {day === data.offDay && <span className="ml-1 text-xs">(Off)</span>}
                  </button>
                ))}
              </div>
              
              {/* Day's schedule */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-medium mb-3 text-gray-700">
                  {currentDay}'s Schedule
                </h3>
                
                {currentDay === data.offDay ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
                    <Coffee className="text-blue-500 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-700">Rest Day</h4>
                      <p className="text-blue-600 text-sm">
                        Today is your scheduled day off. Take time to recharge and prepare for the week ahead.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedule
                      .find(day => day.day === currentDay)
                      ?.sessions.map((session, index) => (
                        <div
                          key={index}
                          className={`rounded-md p-3 flex justify-between items-center ${
                            session.break
                              ? "bg-green-50 border border-green-100"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            {session.break ? (
                              <Coffee className="text-green-500 mr-3" size={18} />
                            ) : (
                              <BookOpen className="text-indigo-500 mr-3" size={18} />
                            )}
                            <div>
                              <h4 className={`font-medium ${
                                session.break ? "text-green-700" : "text-gray-800"
                              }`}>
                                {session.break ? "Break" : session.subject}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {session.startTime} - {session.endTime}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                            {calculateDuration(session.startTime, session.endTime)} min
                          </span>
                        </div>
                      )) || (
                        <div className="text-center py-6 text-gray-500">
                          <p>No study sessions scheduled for this day.</p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Daily Target</h3>
                <p className="text-2xl font-bold text-indigo-600">{data.dailyTargetStudyHours} hours</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Study Block</h3>
                <p className="text-2xl font-bold text-indigo-600">{data.studyBlockDuration} min</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Break Duration</h3>
                <p className="text-2xl font-bold text-indigo-600">{data.breakDuration} min</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
              <Target className="mr-2" size={20} />
              Goals & Targets
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                <h3 className="text-md font-medium text-indigo-700 mb-4 flex items-center">
                  <Award className="mr-2" size={18} />
                  Weekly Goals
                </h3>
                
                <div className="space-y-3">
                  {weeklyGoals.map((goal, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-5 w-5 rounded-full border-2 border-indigo-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                      </div>
                      <p className="ml-3 text-indigo-700">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
                  <h3 className="text-md font-medium text-emerald-700 mb-3">Study Target Progress</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-emerald-600">Daily Hours</span>
                      <span className="text-sm font-medium text-emerald-700">{data.dailyTargetStudyHours} hours</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-emerald-600">Weekly Progress</span>
                      <span className="text-sm font-medium text-emerald-700">18/{data.dailyTargetStudyHours * 6} hours</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rose-50 p-5 rounded-lg border border-rose-100">
                  <h3 className="text-md font-medium text-rose-700 mb-3">Subject Focus</h3>
                  
                  {data.subjects.map((subject, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-rose-600">{subject.name}</span>
                        <span className="text-xs font-medium px-2 py-1 bg-rose-100 text-rose-700 rounded">
                          Priority {subject.priority}
                        </span>
                      </div>
                      <div className="w-full bg-rose-200 rounded-full h-2.5">
                        <div 
                          className="bg-rose-500 h-2.5 rounded-full" 
                          style={{ width: `${100 - subject.priority * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "todos" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
              <CheckSquare className="mr-2" size={20} />
              Today's To-Do List ({currentDay})
            </h2>
            
            <div className="space-y-6">
              {/* Daily Tasks */}
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <h3 className="text-md font-medium text-amber-700 mb-4">Daily Tasks</h3>
                
                <div className="space-y-3">
                  {dailyTodos.map((todo, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-6 w-6 rounded-md border border-amber-300 mr-3 flex-shrink-0"></div>
                      <p className="text-amber-700">{todo}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Session Breakdown */}
              <div className="bg-teal-50 p-5 rounded-lg border border-teal-100">
                <h3 className="text-md font-medium text-teal-700 mb-4">Today's Study Sessions</h3>
                
                {currentDay === data.offDay ? (
                  <div className="bg-teal-100 border border-teal-200 rounded-md p-4">
                    <p className="text-teal-700 text-center">
                      Today is your scheduled off day. Enjoy your rest!
                    </p>
                  </div>
                ) : todaySessions.length > 0 ? (
                  <div className="space-y-3">
                    {todaySessions.filter(s => !s.isBreak).map((session, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-teal-200">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-md border border-teal-300 mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-teal-700 font-medium">{session.subject}</p>
                            <p className="text-teal-600 text-sm">{session.start} - {session.end}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                          {data.studyBlockDuration} min
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-teal-100 border border-teal-200 rounded-md p-4">
                    <p className="text-teal-700 text-center">
                      No study sessions scheduled for today.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Quick Notes */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-700 mb-2">Quick Notes</h3>
                <textarea 
                  className="w-full h-24 rounded-md border border-gray-300 p-3 text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add your thoughts or notes for today..."
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
        <p>Study Timetable Dashboard • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}