import { AlertCircle, Info, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useStudyPlanner } from '../context/StudyPlannerContext';

interface DailySchedule {
  day: string;
  sleepHours: number;
  collegeHours: number;
  othersHours: number;
  availableHours: number;
}

interface TimeTableEntry {
  day: string;
  startTime: string;
  endTime: string;
}

const DailyHoursCalculator = () => {
  const navigate = useNavigate();
  const { setWeeklySchedule, setTotalWeeklyHours } = useStudyPlanner();

  const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([
    { day: 'Sunday', sleepHours: 8, collegeHours: 0, othersHours: 2, availableHours: 14 },
    { day: 'Monday', sleepHours: 8, collegeHours: 6, othersHours: 2, availableHours: 8 },
    { day: 'Tuesday', sleepHours: 8, collegeHours: 6, othersHours: 2, availableHours: 8 },
    { day: 'Wednesday', sleepHours: 8, collegeHours: 6, othersHours: 2, availableHours: 8 },
    { day: 'Thursday', sleepHours: 8, collegeHours: 6, othersHours: 2, availableHours: 8 },
    { day: 'Friday', sleepHours: 8, collegeHours: 6, othersHours: 2, availableHours: 8 },
    { day: 'Saturday', sleepHours: 8, collegeHours: 3, othersHours: 2, availableHours: 11 }
  ]);
  const [error, setError] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  const calculateCollegeHours = (entries: TimeTableEntry[]): { [key: string]: number } => {
    const dailyHours: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      if (!entry.startTime || !entry.endTime || !entry.day) return;
      
      const start = new Date(`1970-01-01T${entry.startTime}`);
      const end = new Date(`1970-01-01T${entry.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      dailyHours[entry.day] = (dailyHours[entry.day] || 0) + hours;
    });
    
    return dailyHours;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      let timeTableEntries: TimeTableEntry[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            timeTableEntries = results.data as TimeTableEntry[];
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        timeTableEntries = XLSX.utils.sheet_to_json(worksheet);
      } else {
        setError('Please upload a CSV or Excel file');
        return;
      }

      const collegeHours = calculateCollegeHours(timeTableEntries);
      
      setDailySchedule(prev => prev.map(schedule => ({
        ...schedule,
        collegeHours: collegeHours[schedule.day] || 0,
        availableHours: 24 - schedule.sleepHours - (collegeHours[schedule.day] || 0) - schedule.othersHours
      })));
    } catch (err) {
      setError('Error processing file. Please check the format.');
      console.error(err);
    }
  };

  const updateSchedule = (index: number, field: 'sleepHours' | 'collegeHours' | 'othersHours', value: number) => {
    const newSchedule = [...dailySchedule];
    newSchedule[index][field] = value;
    newSchedule[index].availableHours = 24 - newSchedule[index].sleepHours - newSchedule[index].collegeHours - newSchedule[index].othersHours;
    setDailySchedule(newSchedule);
  };

  const totalWeeklyHours = dailySchedule.reduce((sum, day) => sum + day.availableHours, 0);

  const handleNext = (schedule: DailySchedule[]) => {
    setWeeklySchedule(schedule as any);
    setTotalWeeklyHours(totalWeeklyHours);
    navigate('/exam-schedule');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Daily Hours Calculator</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-white border-gray-300 hover:bg-gray-50 transition-all duration-200">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-blue-500" />
              <p className="mb-2 text-sm font-medium text-gray-700">
                <span className="font-semibold">Upload your timetable</span>
              </p>
              <p className="text-xs text-gray-500">CSV or Excel file (.xlsx, .xls)</p>
              <p className="mt-1 text-xs text-gray-400">Your file should have day, startTime, and endTime columns</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </label>
        </div>
        {error && (
          <div className="mt-3 flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Sleep Hours
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    College Hours
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    Others
                    <div className="relative ml-1">
                      <Info 
                        className="w-4 h-4 text-gray-500 cursor-help" 
                        onMouseEnter={() => setShowTooltip(-1)}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === -1 && (
                        <div className="absolute z-10 w-64 bg-gray-800 text-white text-xs rounded-md p-2 -mt-1 ml-1">
                          Time spent on daily activities like eating, traveling, chores, etc.
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailySchedule.map((schedule, index) => (
                <tr key={schedule.day} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {schedule.day}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="4"
                      max="12"
                      value={schedule.sleepHours}
                      onChange={(e) => updateSchedule(index, 'sleepHours', Number(e.target.value))}
                      className="w-20 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={schedule.collegeHours}
                      onChange={(e) => updateSchedule(index, 'collegeHours', Number(e.target.value))}
                      className="w-20 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={schedule.othersHours}
                        onChange={(e) => updateSchedule(index, 'othersHours', Number(e.target.value))}
                        className="w-20 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                      />
                      <Info 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-help" 
                        onMouseEnter={() => setShowTooltip(index)}
                        onMouseLeave={() => setShowTooltip(null)}
                      />
                      {showTooltip === index && (
                        <div className="absolute z-10 w-48 bg-gray-800 text-white text-xs rounded-md p-2 right-8">
                          Time spent on meals, commuting, personal care, etc.
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    schedule.availableHours < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {schedule.availableHours} hours
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="text-lg font-medium mb-4 md:mb-0 text-gray-800">
          Total Weekly Available Hours: <span className="text-blue-700 font-bold">{totalWeeklyHours} hours</span>
        </div>
        <button
          onClick={() => handleNext(dailySchedule)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
        >
          Continue to Next Step
        </button>
      </div>
    </div>
  );
};

export default DailyHoursCalculator;