import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export const authAPI = {
    login: (email, password, role) => api.post('/auth/login', { email, password, role }),
    register: (formData) => api.post('/auth/register', formData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update', data)
};

export const certAPI = {
    // Student endpoints
    upload: (formData) => api.post('/certificates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyCertificates: () => api.get('/certificates/student/my-certificates'),

    // Faculty endpoints
    getFacultyPending: () => api.get('/certificates/faculty/pending'),

    // HOD endpoints
    getHodPending: () => api.get('/certificates/hod/pending'),

    // Shared Approval/Rejection (Backend handles role check)
    approve: (id) => api.put(`/certificates/${id}/approve`),
    reject: (id, remark) => api.put(`/certificates/${id}/reject`, { remark })
};

export const notifAPI = {
    getAll: () => api.get('/notifications'),
    markRead: (id) => api.put(`/notifications/${id}/read`)
};

export default api;