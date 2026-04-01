import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Bell, Search, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ role }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 right-0 left-0 sm:left-64 z-30 px-4 sm:px-8 py-4 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 sm:px-6 py-3 flex justify-between items-center w-full pointer-events-auto transition-all duration-300">
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center relative group">
                        <Search className="w-4 h-4 absolute left-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search documents, IDs..." 
                            className="bg-gray-100/80 border-none rounded-xl pl-10 pr-4 py-2 text-sm font-semibold w-72 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none placeholder-gray-400 text-gray-800"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                    <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors group">
                        <div className="absolute inset-0 bg-indigo-50 rounded-xl scale-0 group-hover:scale-100 transition-transform origin-center"></div>
                        <Bell className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse z-20"></span>
                    </Link>

                    <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

                    <div className="flex items-center gap-3">
                        <div className="hidden flex-col items-end sm:flex">
                            <span className="text-sm font-black text-gray-900 leading-none">{user?.name || 'User Name'}</span>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1 bg-indigo-50 px-2 py-0.5 rounded-full">{role}</span>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-2 border-white ring-2 ring-indigo-50">
                            <User className="w-5 h-5" />
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="ml-1 sm:ml-2 p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
