import { useNavigate } from 'react-router-dom';
import { useStudyPlanner } from '../context/StudyPlannerContext';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStudyPlanner();

  const goToNextStep = (currentPath: string) => {
    const routes = {
      '/daily-hours': '/exam-schedule',
      '/exam-schedule': '/syllabus',
      '/syllabus': '/priority',
      '/priority': '/timetable'
    };

    navigate(routes[currentPath]);
  };

  return { goToNextStep };
};