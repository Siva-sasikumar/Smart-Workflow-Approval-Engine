import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import HodDashboard from './pages/HodDashboard';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CertificateDetails from './pages/CertificateDetails';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard view="dashboard" />} />
            <Route path="/student/certificates" element={<StudentDashboard view="vault" />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['hod']} />}>
            <Route path="/hod/dashboard" element={<HodDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['student', 'faculty', 'hod']} />}>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/certificate/:id" element={<CertificateDetails />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
