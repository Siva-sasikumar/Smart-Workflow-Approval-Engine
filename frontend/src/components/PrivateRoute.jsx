import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'student') return <Navigate to="/student-dashboard" />;
        if (user.role === 'faculty') return <Navigate to="/faculty-dashboard" />;
        if (user.role === 'hod') return <Navigate to="/hod-dashboard" />;
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
