import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/Auth';
import CreateTimeTable from './pages/CreateTimeTable';
import Timetable from './pages/Timetable';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/daily-hours" />} /> */}
        <Route path="/" element={<CreateTimeTable />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/timetable/:id" element={<Timetable />} />


      </Routes>
    </Router>
  );
}

export default App;
