import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FileCheck, 
    Settings, 
    LogOut,
    Bell,
    Layers,
    Activity,
    Users,
    ChevronRight,
    Search,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ role }) => {
    const { logout } = useAuth();

    const getLinks = () => {
        const commonLinks = [
            { to: '/notifications', label: 'Alerts', icon: Bell },
            { to: '/settings', label: 'Settings', icon: Settings },
        ];

        const roleLinks = {
            student: [
                { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/student/certificates', label: 'My Vault', icon: FileCheck },
            ],
            faculty: [
                { to: '/faculty/dashboard', label: 'Review Portal', icon: Layers },
            ],
            hod: [
                { to: '/hod/dashboard', label: 'Approval Desk', icon: ShieldCheck },
            ]
        };
        const links = [...(roleLinks[role] || [])];
        
        // Add common links after role specific links
        return [...links, ...commonLinks];
    };

    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-slate-900 border-r border-slate-800 shadow-2xl">
            <div className="h-full px-4 py-8 overflow-y-auto flex flex-col justify-between">
                <div>
                   <div className="px-4 mb-10 flex items-center gap-3">
                       <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                           <ShieldCheck className="w-6 h-6 text-white" />
                       </div>
                       <span className="text-xl font-black text-white tracking-tight">Intern Hub</span>
                   </div>

                   <div className="px-2 mb-8">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4 pl-2">Core Navigation</p>
                       <ul className="space-y-2">
                           {getLinks().map((link) => (
                               <li key={link.to}>
                                   <NavLink
                                       to={link.to}
                                       end={link.to === '/student/dashboard' || link.to === '/faculty/dashboard' || link.to === '/hod/dashboard'}
                                       className={({ isActive }) =>
                                           `flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl group transition-all duration-300 relative overflow-hidden ${
                                               isActive
                                                   ? 'text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                                                   : 'text-slate-400 hover:text-white hover:bg-white/5'
                                           }`
                                       }
                                   >
                                       {({ isActive }) => (
                                           <>
                                               {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-md"></div>}
                                               <link.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-500 group-hover:text-indigo-400 group-hover:scale-110'}`} />
                                               <span className="z-10">{link.label}</span>
                                               {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400" />}
                                           </>
                                       )}
                                   </NavLink>
                               </li>
                           ))}
                       </ul>
                   </div>
                </div>

                <div className="px-4 mb-2">
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[2px]">Systems OK</p>
                        <div className="flex justify-center items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                            <span className="text-xs text-slate-300 font-bold tracking-widest">v2.0.4-PRO</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
