import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession, loadMe } from './redux/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Exams from './pages/admin/Exams';
import ExamForm from './pages/admin/ExamForm';
import Questions from './pages/admin/Questions';
import Students from './pages/admin/Students';
import AdminResults from './pages/admin/Results';
import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import ExamInstructions from './pages/student/ExamInstructions';
import ExamRoom from './pages/student/ExamRoom';
import Results from './pages/student/Results';
import Profile from './pages/Profile';
import ErrorPage from './pages/ErrorPage';

export default function App() {
  const dispatch = useDispatch(), user = useSelector(state => state.auth.user);
  useEffect(() => { dispatch(loadMe()); const expired = () => dispatch(clearSession()); window.addEventListener('session-expired', expired); return () => window.removeEventListener('session-expired', expired); }, [dispatch]);
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace/>}/>
    <Route element={<AuthLayout/>}>
      <Route path="login" element={user ? <Navigate to={`/${user.role}`}/> : <Login/>}/>
      <Route path="register" element={<Navigate to="/login" replace/>}/>
      <Route path="forgot-password" element={<Navigate to="/login" replace/>}/>
    </Route>
    <Route element={<ProtectedRoute role="admin"/>}><Route element={<DashboardLayout/>}>
      <Route path="admin" element={<AdminDashboard/>}/><Route path="admin/exams" element={<Exams/>}/><Route path="admin/exams/new" element={<ExamForm/>}/><Route path="admin/exams/:id/edit" element={<ExamForm/>}/><Route path="admin/exams/:id/questions" element={<Questions/>}/><Route path="admin/students" element={<Students/>}/><Route path="admin/results" element={<AdminResults/>}/>
    </Route></Route>
    <Route element={<ProtectedRoute role="student"/>}>
      <Route element={<DashboardLayout/>}><Route path="student" element={<StudentDashboard/>}/><Route path="student/exams" element={<StudentExams/>}/><Route path="student/results" element={<Results/>}/><Route path="student/results/:id" element={<Results/>}/></Route>
      <Route path="exam/:code" element={<ExamInstructions/>}/><Route path="exam-room/:id" element={<ExamRoom/>}/>
    </Route>
    <Route element={<ProtectedRoute/>}><Route element={<DashboardLayout/>}><Route path="profile" element={<Profile/>}/></Route></Route>
    <Route path="unauthorized" element={<ErrorPage unauthorized/>}/><Route path="*" element={<ErrorPage/>}/>
  </Routes>;
}
