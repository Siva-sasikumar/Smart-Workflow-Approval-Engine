import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    await checkUser(); // Added await
                } catch (error) {
                    console.error('Error checking user:', error);
                }
            } else {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []); // ✅ Fixed: dependency array properly placed

    const checkUser = () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setUser({ role });
            setIsAuthenticated(true);
        }
        setLoading(false);
    };

    const login = async (email, password, role) => {
        try {
            const res = await authAPI.login(email, password, role);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setUser({ role: res.data.role });
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Login failed' };
        }
    };

    const register = async (formData) => {
        try {
            const res = await authAPI.register(formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', 'student'); // Default to student
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setUser({ role: 'student' });
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const forgotPassword = async (email) => {
        try {
            const res = await authAPI.forgotPassword(email);
            return { success: true, msg: res.data.msg, data: res.data };
        } catch (err) {
            return { success: false, msg: err.response?.data?.msg || 'Error' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, forgotPassword }}>
            {children}
        </AuthContext.Provider>
    );
};