import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import CreateTimeTable from './pages/CreateTimeTable';
import HomePage from './pages/HomePage';
import Timetable from './pages/Timetable';

function App() {
  const [, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigate('/auth');
    }
  }, []);

  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/daily-hours" />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/create-timetable" element={<CreateTimeTable />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/timetable/:id" element={<Timetable />} />


      </Routes>
    </>
  );
}

export default App;
