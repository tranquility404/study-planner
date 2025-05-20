import { BookOpen, Calendar, CheckSquare, Clock, Coffee, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTimetable } from "../api/apiRequests";
import ChatBotOverlay from "../components/ChatBot";

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

interface Challenge {
  id: string;
  subject: string;
  duration: number;
  completed: boolean;
  points: number;
}

interface SessionHistory {
  subject: string;
  completed: number;
  missed: number;
  target: number;
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
  todayScore: number;
  todayChallenges: Challenge[];
  sessionHistory: SessionHistory[];
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

const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  return end - start;
};

export default function Timetable() {
  const { id } = useParams();

  const getCurrentDay = () => {
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
    return dayMap[today as keyof typeof dayMap];
  };

  const [data, setData] = useState<TimetableData>({
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
    "offDay": "Sunday",
    "todayScore": 75,
    "todayChallenges": [
      { "id": "ch1", "subject": "Maths", "duration": 50, "completed": true, "points": 25 },
      { "id": "ch2", "subject": "Physics", "duration": 50, "completed": true, "points": 25 },
      { "id": "ch3", "subject": "Chemistry", "duration": 50, "completed": false, "points": 25 },
      { "id": "ch4", "subject": "English", "duration": 50, "completed": true, "points": 25 }
    ],
    "sessionHistory": [
      { "subject": "Maths", "completed": 15, "missed": 2, "target": 20 },
      { "subject": "Physics", "completed": 10, "missed": 5, "target": 15 },
      { "subject": "Chemistry", "completed": 8, "missed": 7, "target": 15 },
      { "subject": "English", "completed": 12, "missed": 3, "target": 15 }
    ]
  });

  const [schedule, setSchedule] = useState<DaySchedule[]>([
  {
    "day": "Monday",
    "sessions": [
      {
        "subject": "Maths",
        "startTime": "18:00",
        "endTime": "19:30",
        "break": false
      },
      {
        "break": true,
        "startTime": "19:30",
        "endTime": "19:45"
      },
      {
        "subject": "English",
        "startTime": "19:45",
        "endTime": "21:15",
        "break": false
      }
    ]
  },
  {
    "day": "Tuesday",
    "sessions": [
      {
        "subject": "Chemistry",
        "startTime": "18:00",
        "endTime": "19:30",
        "break": false
      },
      {
        "break": true,
        "startTime": "19:30",
        "endTime": "19:45"
      },
      {
        "subject": "Physics",
        "startTime": "19:45",
        "endTime": "21:15",
        "break": false
      }
    ]
  },
  {
    "day": "Wednesday",
    "sessions": [
      {
        "subject": "Biology",
        "startTime": "18:00",
        "endTime": "19:30",
        "break": false
      },
      {
        "break": true,
        "startTime": "19:30",
        "endTime": "19:45"
      },
      {
        "subject": "Human Values",
        "startTime": "19:45",
        "endTime": "21:15",
        "break": false
      }
    ]
  },
  {
    "day": "Thursday",
    "sessions": [
      {
        "subject": "Maths",
        "startTime": "18:00",
        "endTime": "19:30",
        "break": false
      },
      {
        "break": true,
        "startTime": "19:30",
        "endTime": "19:45"
      },
      {
        "subject": "English",
        "startTime": "19:45",
        "endTime": "21:15",
        "break": false
      }
    ]
  },
  {
    "day": "Friday",
    "sessions": [
      {
        "subject": "Chemistry",
        "startTime": "18:00",
        "endTime": "19:30",
        "break": false
      },
      {
        "break": true,
        "startTime": "19:30",
        "endTime": "19:45"
      },
      {
        "subject": "Physics",
        "startTime": "19:45",
        "endTime": "21:15",
        "break": false
      }
    ]
  },
  {
    "day": "Saturday",
    "sessions": []
  },
  {
    "day": "Sunday",
    "sessions": []
  }
]
);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const res = await fetchTimetable(id);
          const scheduleData = res.data.data.schedule["time table"];
          const gatheredData = res.data.data.schedule.gathered_data;
          const scoreData = scheduleData[5].score_data[0]; // Getting the score data

          // Set the schedule
          setSchedule(scheduleData.slice(0, 5)); // Only take the first 5 days, excluding score_data

          // Map the challenges from score data
          const mappedChallenges = scoreData.studySessions.map((session: any, index: number) => ({
            id: `ch${index + 1}`,
            subject: session.subject,
            duration: session.durationMinutes,
            completed: session.status === 'completed',
            points: session.points || 25
          }));

          // Update the data state with both schedule and gathered data
          setData({
            timetableName: gatheredData.timetableName,
            subjects: gatheredData.subjects,
            preferredStudyTime: gatheredData.preferredStudyTime,
            studyBlockDuration: gatheredData.studyBlockDuration,
            breakDuration: gatheredData.breakDuration,
            dailyTargetStudyHours: gatheredData.dailyTargetStudyHours,
            availableBlocks: gatheredData.availableBlocks,
            offDay: gatheredData.offDay,
            todayScore: scoreData.todaysScore,
            todayChallenges: mappedChallenges,
            sessionHistory: gatheredData.subjects.map((subject: any) => ({
              subject: subject.name,
              completed: Math.floor(Math.random() * 15) + 5, // Placeholder data
              missed: Math.floor(Math.random() * 5), // Placeholder data
              target: 15 // Placeholder data
            }))
          });

        } catch (error) {
          console.error('Error fetching timetable:', error);
          // Handle error appropriately
        }
      }
    };

    fetchData();
  }, [id]);

  const [currentDay, setCurrentDay] = useState(getCurrentDay());
  const [activeTab, setActiveTab] = useState("timetable");
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Toggle challenge completion
  const toggleChallengeCompletion = (id: string) => {
    setData(prevData => {
      const updatedChallenges = prevData.todayChallenges.map(challenge => {
        if (challenge.id === id) {
          const newCompleted = !challenge.completed;
          // Adjust today's score based on completion status
          // let scoreAdjustment = newCompleted ? challenge.points : -challenge.points;

          return {
            ...challenge,
            completed: newCompleted
          };
        }
        return challenge;
      });

      // Calculate new score
      const newScore = updatedChallenges.reduce((score, challenge) => {
        return score + (challenge.completed ? challenge.points : 0);
      }, 0);

      return {
        ...prevData,
        todayChallenges: updatedChallenges,
        todayScore: newScore
      };
    });
  };

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
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === "timetable"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Calendar className="mr-2" size={16} />
              Timetable
            </button>
            <button
              onClick={() => setActiveTab("challenges")}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === "challenges"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Target className="mr-2" size={16} />
              Challenges
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
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${currentDay === day
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
                    {schedule && schedule
                      .find(day => day.day === currentDay)
                      ?.sessions.map((session, index) => (
                        <div
                          key={index}
                          className={`rounded-md p-3 flex justify-between items-center ${session.break
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
                              <h4 className={`font-medium ${session.break ? "text-green-700" : "text-gray-800"
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

        {activeTab === "challenges" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Target className="mr-2" size={20} />
                Today's Challenges
              </h2>
              <div className="flex items-center bg-indigo-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-indigo-700 mr-2">Today's Score:</span>
                <span className="text-lg font-bold text-indigo-700">{data.todayScore}</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Today's Challenges */}
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <h3 className="text-md font-medium text-amber-700 mb-4">Study Sessions Checklist</h3>

                {currentDay === data.offDay ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
                    <Coffee className="text-blue-500 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-700">Rest Day</h4>
                      <p className="text-blue-600 text-sm">
                        Today is your scheduled day off. No challenges today. Take time to recharge!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.todayChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="flex items-center justify-between bg-white p-3 rounded-md border border-amber-200"
                      >
                        <div className="flex items-center">
                          <div
                            onClick={() => toggleChallengeCompletion(challenge.id)}
                            className={`h-6 w-6 rounded-md border flex-shrink-0 mr-3 flex items-center justify-center cursor-pointer
                              ${challenge.completed
                                ? "bg-amber-500 border-amber-600"
                                : "border-amber-300 bg-white"}`}
                          >
                            {challenge.completed && <CheckSquare size={14} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-amber-700 font-medium">{challenge.subject} Session</p>
                            <p className="text-amber-600 text-sm">{challenge.duration} min session</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded mr-2">
                            {challenge.points} pts
                          </span>
                          {challenge.completed && (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckSquare size={14} className="text-green-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Tracker */}
              <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
                <h3 className="text-md font-medium text-emerald-700 mb-3">Challenge Progress</h3>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-emerald-600">Completion Rate</span>
                    <span className="text-sm font-medium text-emerald-700">
                      {data.todayChallenges.filter(c => c.completed).length}/{data.todayChallenges.length} challenges
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{
                        width: `${(data.todayChallenges.filter(c => c.completed).length / data.todayChallenges.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-emerald-600">Points Earned</span>
                    <span className="text-sm font-medium text-emerald-700">
                      {data.todayScore}/{data.todayChallenges.reduce((sum, c) => sum + c.points, 0)} points
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{
                        width: `${(data.todayScore / data.todayChallenges.reduce((sum, c) => sum + c.points, 0)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Notes */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-700 mb-2">Study Notes</h3>
                <textarea
                  className="w-full h-24 rounded-md border border-gray-300 p-3 text-gray-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add notes about today's challenges..."
                ></textarea>
              </div>
            </div>
          </div>
        )}

         <ChatBotOverlay 
        width="w-80" 
        height="h-96" 
        position="bottom-right"
        title="Timetable Assistant"
        botIntro="Hello! 👋 I'm your timetable assistant. Ask me anything about your classes or schedule!"
        theme="light"
      />

      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
        <p>Study Timetable Dashboard • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}