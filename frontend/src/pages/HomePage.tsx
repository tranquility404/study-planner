import { BookOpen, Calendar, ChevronRight, Clock, LogOut, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deletTimetable, getAllTimetables } from '../api/apiRequests';

interface Subject {
  id: string;
  name: string;
  difficultyLevel: string;
  priority: number;
  dailyRevisionRequired: boolean;
}

interface TimetableData {
  _id: string;
  user_id: string;
  username: string;
  schedule: {
    gathered_data: {
      timetableName: string;
      subjects: Subject[];
      preferredStudyTime: string;
      studyBlockDuration: number;
      breakDuration: number;
      dailyTargetStudyHours: number;
      offDay: string;
    };
  };
}

const HomePage: React.FC = () => {
  // Mock data from your JSON - in a real app, this would come from props or API
  const [ timetables, setTimetables ] = useState<TimetableData[]>([]);

  useEffect(() => {
    const fetchTimetables = async () => {
      const response = await getAllTimetables(); // Replace with your actual API endpoint
      setTimetables(response.data);
    };

    fetchTimetables();

    }, []);

  const navigate = useNavigate();

  const handleCreateNewTimetable = () => {
    navigate('/create-timetable');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
    // toast.success("Logged out successfully");
  };

  const handleTimetableClick = (id: string) => {
    navigate(`/timetable/${id}`);
    // console.log(`Navigate to /timetable/${id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  async function handleDeleteTimetable(_id: string) {
    const res = await deletTimetable(_id);
    if (res.status === 200) {
      setTimetables((prevTimetables) => prevTimetables.filter((timetable) => timetable._id !== _id));
      toast.success('Timetable deleted successfully');
    } else {
      toast.error('Failed to delete timetable');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">StudyScheduler</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateNewTimetable}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Timetable
              </button>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Tranquility!</h2>
          <p className="text-gray-600">Manage your study schedules and stay organized with your learning goals.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Timetables</p>
                <p className="text-2xl font-bold text-gray-900">{timetables.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {timetables.reduce((acc, tt) => acc + tt.schedule.gathered_data.subjects.length, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Hours/Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {timetables.length > 0 ? timetables[0].schedule.gathered_data.dailyTargetStudyHours : 0}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timetables Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Timetables</h3>
          
          {timetables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timetables yet</h3>
              <p className="text-gray-600 mb-4">Create your first study schedule to get started.</p>
              <button
                onClick={handleCreateNewTimetable}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Timetable
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timetables.map((timetable) => (
                <div
  key={timetable._id}
  className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200 group relative"
>
  {/* Delete Button - positioned in top right corner */}

  {/* Card content that's clickable */}
  <div 
    className="cursor-pointer" 
    onClick={() => handleTimetableClick(timetable._id)}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {timetable.schedule.gathered_data.timetableName}
        </h4>
        <p className="text-sm text-gray-600">
          {timetable.schedule.gathered_data.subjects.length} subject{timetable.schedule.gathered_data.subjects.length !== 1 ? 's' : ''}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </div>
   
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Study Time:</span>
        <span className="text-sm font-medium text-gray-900">
          {timetable.schedule.gathered_data.preferredStudyTime}
        </span>
      </div>
     
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Daily Target:</span>
        <span className="text-sm font-medium text-gray-900">
          {timetable.schedule.gathered_data.dailyTargetStudyHours}h
        </span>
      </div>
     
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Rest Day:</span>
        <span className="text-sm font-medium text-gray-900">
          {timetable.schedule.gathered_data.offDay}
        </span>
      </div>
    </div>
   
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex flex-wrap gap-2">
        {timetable.schedule.gathered_data.subjects.slice(0, 3).map((subject) => (
          <span
            key={subject.id}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(subject.difficultyLevel)}`}
          >
            {subject.name}
          </span>
        ))}
        {timetable.schedule.gathered_data.subjects.length > 3 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{timetable.schedule.gathered_data.subjects.length - 3} more
          </span>
        )}
  <button
    onClick={(e) => {
      e.stopPropagation(); // Prevent triggering the card click
      handleDeleteTimetable(timetable._id);
    }}
    className="ml-auto p-1.5 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
    aria-label="Delete timetable"
  >
    <Trash2 className="w-4 h-4 text-red-600" />
  </button>
      </div>
    </div>
  </div>
</div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;