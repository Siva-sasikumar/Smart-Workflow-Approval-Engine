import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { authAPI, certAPI } from '../services/api';
import { 
    User, Mail, Briefcase, Lock, Bell, Activity, 
    ChevronRight, Shield, Save, CheckCircle, 
    AlertCircle, Loader, UserCircle, Key
} from 'lucide-react';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        department: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [resetMsg, setResetMsg] = useState({ type: '', text: '' });
    const role = localStorage.getItem('role') || 'student';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch User Profile
            const userRes = await authAPI.getMe();
            setUser(userRes.data);
            setEditForm({
                name: userRes.data.name || '',
                department: userRes.data.department || ''
            });

            // Fetch Stats based on Role
            let statsData = { total: 0, pending: 0, approved: 0, rejected: 0 };

            if (role === 'student') {
                const res = await certAPI.getMyCertificates();
                const certs = res.data.data || [];
                statsData = {
                    total: certs.length,
                    pending: certs.filter(c => c.status === 'pending').length,
                    approved: certs.filter(c => c.status === 'approved').length,
                    rejected: certs.filter(c => c.status === 'rejected').length
                };
            } else if (role === 'faculty') {
                const res = await certAPI.getFacultyPending();
                const certs = res.data.data || [];
                statsData = {
                    total: certs.length,
                    pending: certs.length,
                    approved: 0,
                    rejected: 0
                };
            } else if (role === 'hod') {
                const res = await certAPI.getHodPending();
                const certs = res.data.data || [];
                statsData = {
                    total: certs.length,
                    pending: certs.length,
                    approved: 0,
                    rejected: 0
                };
            }

            setStats(statsData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching settings data:', err);
            setLoading(false);
        }
    };

    if (loading) return (
        <Layout role={role}>
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500 font-medium">Loading preferences...</p>
            </div>
        </Layout>
    );

    const handleEdit = () => {
        setIsEditing(true);
        setEditForm({
            name: user.name || '',
            department: user.department || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            name: user.name || '',
            department: user.department || ''
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await authAPI.updateProfile(editForm);
            setUser(res.data);
            setIsEditing(false);
            setIsSaving(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setIsSaving(false);
            alert('Failed to update profile');
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            const res = await authAPI.forgotPassword(user.email);
            setResetMsg({
                type: 'success',
                text: 'A password reset link has been sent to your registered email.'
            });
            setTimeout(() => setResetMsg({ type: '', text: '' }), 10000);
        } catch (err) {
            console.error(err);
            setResetMsg({ type: 'error', text: 'Failed to initiate password reset.' });
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: UserCircle },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'activity', label: 'System Activity', icon: Activity },
    ];

    return (
        <Layout role={role}>
            <div className="mb-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-3xl"></div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">Account Preferences</h1>
                <p className="text-gray-500 mt-2 font-medium text-lg">Customize your profile and manage account security</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Modern Sidebar Navigation */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-indigo-50/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
                            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Navigation
                            </p>
                        </div>
                        <nav className="flex flex-col p-4 gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden group ${activeTab === tab.id
                                        ? 'text-white shadow-xl shadow-indigo-200 translate-x-1'
                                        : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-indigo-600 border border-transparent hover:border-gray-100'
                                    }`}
                                >
                                    {activeTab === tab.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 -z-10"></div>
                                    )}
                                    <div className={`p-2 rounded-xl transition-colors duration-300 ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-indigo-50'}`}>
                                        <tab.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                                    </div>
                                    <span className="tracking-wide">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Smooth Transitions Content Area */}
                <div className="flex-1">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white overflow-hidden min-h-[600px] relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/40 via-purple-100/20 to-transparent rounded-bl-full -z-0 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            {activeTab === 'general' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-100 pb-6 gap-4">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                                <div className="p-3 bg-indigo-50 rounded-2xl shadow-inner"><UserCircle className="w-7 h-7 text-indigo-600" /></div>
                                                Basic Information
                                            </h2>
                                            <p className="text-gray-500 font-medium mt-2 ml-14">Your personal and institutional details</p>
                                        </div>
                                        {!isEditing ? (
                                            <button
                                                onClick={handleEdit}
                                                className="px-6 py-3 text-sm font-bold text-indigo-600 bg-white hover:bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                            >
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                                >
                                                    {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Apply Changes
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-10 p-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                                        <div className="w-36 h-36 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full p-1 shadow-2xl relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-white overflow-hidden relative">
                                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                                    <span className="text-xs text-white font-bold uppercase tracking-widest text-center px-2">Update</span>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                        </div>
                                        <div className="text-center md:text-left flex-1">
                                            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h3>
                                            <p className="text-indigo-600 font-bold capitalize flex items-center justify-center md:justify-start gap-2 mt-2 text-lg">
                                                <Shield className="w-5 h-5" />
                                                {user?.role} Authority Level
                                            </p>
                                            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                                                <span className="px-4 py-2 bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest rounded-xl border border-green-200 flex items-center gap-2 shadow-sm">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Verified Identity
                                                </span>
                                                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100 shadow-sm">
                                                    Active Session
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Full Legal Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-6 py-4 bg-white border-2 border-indigo-100 rounded-2xl text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all shadow-sm font-semibold text-lg"
                                                />
                                            ) : (
                                                <div className="flex items-center px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-semibold text-lg group hover:bg-white hover:border-indigo-100 transition-colors">
                                                    <User className="w-5 h-5 text-indigo-400 mr-4 group-hover:text-indigo-600 transition-colors" />
                                                    {user?.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Institutional Email</label>
                                            <div className="flex items-center px-6 py-4 bg-gray-50/80 border border-gray-100 rounded-2xl text-gray-500 font-semibold text-lg cursor-not-allowed group">
                                                <Mail className="w-5 h-5 mr-4 text-gray-400" />
                                                {user?.email}
                                                <div className="ml-auto p-1.5 bg-gray-200 rounded-lg">
                                                    <Lock className="w-4 h-4 text-gray-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Academic Department</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.department}
                                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                    className="w-full px-6 py-4 bg-white border-2 border-indigo-100 rounded-2xl text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all shadow-sm font-semibold text-lg"
                                                    placeholder="e.g. Computer Science"
                                                />
                                            ) : (
                                                <div className="flex items-center px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-semibold text-lg group hover:bg-white hover:border-indigo-100 transition-colors">
                                                    <Briefcase className="w-5 h-5 text-indigo-400 mr-4 group-hover:text-indigo-600 transition-colors" />
                                                    {user?.department || 'Information Systems'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Strategic Role</label>
                                            <div className="flex items-center px-6 py-4 bg-gray-50/80 border border-gray-100 rounded-2xl text-gray-500 capitalize font-semibold text-lg">
                                                <Shield className="w-5 h-5 mr-4 text-gray-400" />
                                                {user?.role} Management
                                                <div className="ml-auto p-1.5 bg-gray-200 rounded-lg">
                                                    <Lock className="w-4 h-4 text-gray-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="border-b border-gray-100 pb-6">
                                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                            <div className="p-3 bg-rose-50 rounded-2xl shadow-inner"><Key className="w-7 h-7 text-rose-600" /></div>
                                            Security & Access
                                        </h2>
                                        <p className="text-gray-500 font-medium mt-2 ml-14">Protect your account with advanced security configurations</p>
                                    </div>

                                    <div className="p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-indigo-900 to-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-3xl rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000"></div>
                                        <div className="relative z-10 max-w-xl">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6 text-indigo-200">
                                                <Shield className="w-3 h-3" /> Enhanced Protection
                                            </div>
                                            <h3 className="text-4xl font-black mb-4 tracking-tight drop-shadow-lg">Credential Management</h3>
                                            <p className="text-indigo-100/80 text-lg mb-10 leading-relaxed font-medium">
                                                Your institutional data is secured via AES-256 encryption. Update your password regularly to prevent unauthorized access.
                                            </p>

                                            {resetMsg.text && (
                                                <div className={`p-4 mb-8 rounded-2xl text-sm font-bold border flex items-center gap-3 animate-in fade-in duration-300 shadow-lg backdrop-blur-md ${resetMsg.type === 'success'
                                                    ? 'bg-emerald-500/20 text-emerald-50 border-emerald-500/30'
                                                    : 'bg-rose-500/20 text-rose-50 border-rose-500/30'
                                                    }`}>
                                                    {resetMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                                    {resetMsg.text}
                                                </div>
                                            )}

                                            <button
                                                onClick={handlePasswordReset}
                                                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:scale-[0.98] flex items-center gap-3"
                                            >
                                                Generate Reset Link <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <Lock className="absolute bottom-10 right-10 w-40 h-40 text-white/5 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                    </div>

                                    <div className="space-y-5">
                                        <h4 className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px] mb-6">Advanced Controls</h4>
                                        <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-300">
                                                    <Shield className="w-7 h-7 text-gray-400 group-hover:text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-gray-900 group-hover:text-indigo-700 transition-colors">Two-Factor Authentication</p>
                                                    <p className="text-sm text-gray-500 mt-1 font-medium">Verify login attempts using an authenticator app.</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">Coming Soon</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="border-b border-gray-100 pb-6">
                                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                            <div className="p-3 bg-amber-50 rounded-2xl shadow-inner"><Bell className="w-7 h-7 text-amber-600" /></div>
                                            Communication Preferences
                                        </h2>
                                        <p className="text-gray-500 font-medium mt-2 ml-14">Control when and how you receive system alerts</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { title: 'Workflow Realtime Updates', desc: 'Instant feedback when certificates change stage', active: true, icon: Activity },
                                            { title: 'Direct Institutional Email', desc: 'Formal approval letters and rejection notices', active: true, icon: Mail },
                                            { title: 'System Maintenance Alerts', desc: 'Notifications about portal downtime or updates', active: false, icon: AlertCircle }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 transition-all duration-300 hover:shadow-lg group">
                                                <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                                    <div className={`p-4 rounded-2xl transition-colors ${item.active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg text-gray-900 font-bold">{item.title}</p>
                                                        <p className="text-sm text-gray-500 font-medium mt-1">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button className={`w-16 h-8 rounded-full relative transition-all duration-500 ${item.active ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-200'}`}>
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${item.active ? 'right-1' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 group">
                                            <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Save Preferences
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="border-b border-gray-100 pb-6">
                                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                            <div className="p-3 bg-emerald-50 rounded-2xl shadow-inner"><Activity className="w-7 h-7 text-emerald-600" /></div>
                                            Institutional Analytics
                                        </h2>
                                        <p className="text-gray-500 font-medium mt-2 ml-14">Your comprehensive platform usage statistics</p>
                                    </div>

                                    <div className="bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
                                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-indigo-500/20 to-emerald-500/10 rounded-full blur-3xl -mr-40 -mt-40 transition-transform group-hover:scale-110 duration-1000 pointer-events-none"></div>
                                        <div className="absolute bottom-0 right-0 p-8 opacity-10 transform translate-x-4 translate-y-4 group-hover:-rotate-12 group-hover:scale-125 transition-all duration-1000">
                                            <Activity className="w-64 h-64" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center justify-between">
                                            <div className="text-center md:text-left">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-500/30">
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> System Status: Optimal
                                                </div>
                                                <h4 className="text-5xl font-black mb-4 tracking-tight">Active Connection</h4>
                                                <p className="text-indigo-200 text-lg font-medium max-w-sm">
                                                    You are securely connected to the smart workflow engine with <span className="text-white font-black underline decoration-indigo-500 decoration-4 underline-offset-4">{role.toUpperCase()}</span> privileges.
                                                </p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="px-8 py-6 bg-white/5 backdrop-blur-xl rounded-3xl text-center border border-white/10 shadow-xl group-hover:bg-white/10 transition-colors">
                                                    <p className="text-xs text-indigo-300 font-black uppercase tracking-[3px] mb-2">Network Latency</p>
                                                    <p className="text-3xl font-black text-white">24<span className="text-lg text-indigo-300">ms</span></p>
                                                </div>
                                                <div className="px-8 py-6 bg-white/5 backdrop-blur-xl rounded-3xl text-center border border-white/10 shadow-xl group-hover:bg-white/10 transition-colors">
                                                    <p className="text-xs text-indigo-300 font-black uppercase tracking-[3px] mb-2">Encryption</p>
                                                    <p className="text-3xl font-black text-white">AES<span className="text-lg text-indigo-300">-256</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Total Processing', val: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                            { label: 'Pending Review', val: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
                                            { label: 'Certified Docs', val: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { label: 'Flagged/Rejected', val: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-50' }
                                        ].map((s, idx) => (
                                            <div key={idx} className="bg-white p-6 border border-gray-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group cursor-default relative overflow-hidden">
                                                <div className={`absolute -inset-2 ${s.bg} opacity-0 group-hover:opacity-50 transition-opacity blur-xl rounded-full`}></div>
                                                <div className="relative">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{s.label}</p>
                                                    <p className={`text-5xl font-black ${s.color} drop-shadow-sm`}>{s.val}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
