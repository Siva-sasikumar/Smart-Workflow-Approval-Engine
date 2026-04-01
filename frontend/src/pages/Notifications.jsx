import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { notifAPI } from '../services/api';
import { 
    Bell, CheckCircle, AlertCircle, Info, Clock, 
    Calendar, CheckCheck, Trash2, ShieldAlert,
    Filter, MoreVertical, X, Loader
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role') || 'student';

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notifAPI.getAll();
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notifAPI.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            // Assuming there's an endpoint or just mapping through
            const unread = notifications.filter(n => !n.read);
            await Promise.all(unread.map(n => notifAPI.markRead(n._id)));
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>;
            case 'error': return <div className="p-2 bg-red-50 rounded-lg"><ShieldAlert className="w-5 h-5 text-red-600" /></div>;
            case 'warning': return <div className="p-2 bg-yellow-50 rounded-lg"><AlertCircle className="w-5 h-5 text-yellow-600" /></div>;
            default: return <div className="p-2 bg-indigo-50 rounded-lg"><Info className="w-5 h-5 text-indigo-600" /></div>;
        }
    };

    // Grouping notifications by date
    const groupedNotifications = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            older: []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        notifications.forEach(n => {
            const date = new Date(n.createdAt);
            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                groups.today.push(n);
            } else if (date.getTime() === yesterday.getTime()) {
                groups.yesterday.push(n);
            } else {
                groups.older.push(n);
            }
        });

        return groups;
    }, [notifications]);

    return (
        <Layout role={role}>
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 mb-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Bell className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-indigo-300 font-bold tracking-widest text-xs uppercase">Communication Center</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">System Alerts</h1>
                        <p className="text-slate-300 font-medium text-lg max-w-xl border-l-4 border-indigo-500 pl-4">Real-time updates and chronological log of your workflow journey.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={markAllRead}
                            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 px-6 py-3 rounded-2xl text-xs font-black text-white tracking-widest transition-all shadow-xl flex items-center gap-2"
                        >
                            <CheckCheck className="w-4 h-4" />
                            MARK ALL READ
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                        <div className="relative z-10">
                             <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
                        </div>
                        <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-20 animate-pulse"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <div className="bg-white shadow-xl shadow-indigo-100/50 w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-gray-50 group-hover:-translate-y-2 transition-transform duration-500">
                                <Bell className="w-12 h-12 text-indigo-300" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Inbox Zero</h3>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">You're completely caught up! We'll notify you here when there's an update.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(groupedNotifications).map(([group, items]) => (
                            items.length > 0 && (
                                <div key={group} className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                                    <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[4px] ml-4 mb-5 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                                        {group}
                                    </h2>
                                    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                        {items.map((notif) => (
                                            <div
                                                key={notif._id}
                                                className={`p-6 sm:p-8 flex gap-6 sm:gap-8 transition-colors cursor-pointer group hover:bg-indigo-50/30 ${!notif.read ? 'bg-indigo-50/10' : 'bg-white'}`}
                                                onClick={() => !notif.read && markAsRead(notif._id)}
                                            >
                                                <div className="flex-shrink-0">
                                                     <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-sm ${
                                                         !notif.read ? 'shadow-indigo-100 group-hover:scale-110' : 'group-hover:scale-110'
                                                     } ${
                                                        notif.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                        notif.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                        notif.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                        'bg-indigo-50 border-indigo-100 text-indigo-600'
                                                     }`}>
                                                         {notif.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                                                          notif.type === 'error' ? <ShieldAlert className="w-6 h-6" /> :
                                                          notif.type === 'warning' ? <AlertCircle className="w-6 h-6" /> :
                                                          <Info className="w-6 h-6" />}
                                                     </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <p className={`text-lg leading-relaxed ${notif.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                                                            {notif.message}
                                                        </p>
                                                        {!notif.read && (
                                                            <div className="shrink-0 w-3 h-3 bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.6)] mt-2"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-6 mt-4">
                                                        <p className="text-xs text-gray-400 font-black flex items-center gap-2 uppercase tracking-widest">
                                                            <Clock className="w-4 h-4 text-gray-300" />
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-black flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
                                                            <Calendar className="w-4 h-4 text-gray-300" />
                                                            {new Date(notif.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Notifications;
