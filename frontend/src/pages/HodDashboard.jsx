import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { certAPI } from '../services/api';
import { 
    CheckCircle, XCircle, Clock, FileText, User, Award,
    Search, Filter, Eye, Loader, AlertCircle, History,
    ShieldCheck, Download, Calendar, ChevronRight
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';

const HodDashboard = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState({ show: false, id: null, action: '' });
    const [previewModal, setPreviewModal] = useState({ show: false, cert: null });
    const [remark, setRemark] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const res = await certAPI.getHodPending();
            setCertificates(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!remark && actionModal.action === 'reject') {
            alert('Remark is required for rejection');
            return;
        }

        try {
            if (actionModal.action === 'approve') {
                await certAPI.approve(actionModal.id);
            } else {
                await certAPI.reject(actionModal.id, remark);
            }
            setActionModal({ show: false, id: null, action: '' });
            setRemark('');
            fetchCertificates();
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    const openActionModal = (id, action) => {
        setActionModal({ show: true, id, action });
        setRemark('');
    };

    const openPreview = (cert) => {
        setPreviewModal({ show: true, cert });
    };

    // Filtered and Sorted Certificates
    const filteredCertificates = useMemo(() => {
        return certificates
            .filter(c => {
                const studentName = c.studentName || c.studentId?.name || '';
                const companyName = c.companyName || '';
                return studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       companyName.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                return 0;
            });
    }, [certificates, searchTerm, sortBy]);

    return (
        <Layout role="hod">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 mb-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Award className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-indigo-300 font-bold tracking-widest text-xs uppercase">Executive Desk</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">HOD Approval Portal</h1>
                        <p className="text-slate-300 font-medium text-lg max-w-xl border-l-4 border-indigo-500 pl-4">Final institutional review and authorization for student internships.</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
                        <div className="p-3 bg-emerald-500/20 rounded-xl"><ShieldCheck className="w-6 h-6 text-emerald-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[2px]">Authority Level</p>
                            <span className="text-white font-black text-xl leading-none">Admin Mode</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                        <Award className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="relative z-10 w-full">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Awaiting Final Nod</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{certificates.length}</h3>
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                        <CheckCircle className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="relative z-10 w-full flex flex-col justify-between h-full">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Processed Today</p>
                        <div className="flex items-center justify-between mt-auto">
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">12</h3>
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                        <History className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10 w-full flex flex-col justify-between h-full">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Approval Rate</p>
                        <div className="flex items-center justify-between mt-auto">
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">94%</h3>
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                <History className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                        <Clock className="w-32 h-32 text-orange-600" />
                    </div>
                    <div className="relative z-10 w-full flex flex-col justify-between h-full">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2">Avg. Turnaround</p>
                        <div className="flex items-center justify-between mt-auto">
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">4.2h</h3>
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shadow-inner group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Queue */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                        Final Review Queue
                    </h2>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                        <div className="relative group w-full sm:w-auto">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filter by Name/Company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full sm:w-80 transition-all outline-none"
                            />
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <Filter className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="newest">Newest Submission</option>
                                <option value="oldest">Oldest Submission</option>
                            </select>
                            <ChevronRight className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-24"><div className="relative"><Loader className="w-12 h-12 animate-spin text-indigo-600 relative z-10" /><div className="absolute inset-0 bg-indigo-400 blur-xl opacity-30 animate-pulse"></div></div></div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100 relative">
                                <Award className="w-12 h-12 text-slate-300 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Zero Pending Requests</h3>
                            <p className="text-gray-500 mt-2 font-medium">Excellent! You've cleared the entire executive approval queue.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[2px]">Student Profile</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[2px]">Faculty Remarks</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[2px]">Timeline</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[2px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCertificates.map((cert) => (
                                    <tr key={cert._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                                                    {(cert.studentName || cert.studentId?.name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{cert.studentName || cert.studentId?.name}</p>
                                                    <p className="text-xs font-semibold text-gray-500 mt-0.5">{cert.companyName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {cert.remarks.filter(r => r.role === 'faculty').slice(-1).map((r, i) => (
                                                <div key={i} className="bg-emerald-50/80 border border-emerald-100/50 rounded-2xl p-3 max-w-[280px]">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Faculty Verified</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-emerald-800 line-clamp-2 italic tracking-wide">"{r.comment}"</p>
                                                </div>
                                            ))}
                                            {cert.remarks.filter(r => r.role === 'faculty').length === 0 && (
                                                <span className="text-xs font-medium text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">No faculty remarks added</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                    <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center"><History className="w-3 h-3" /></div>
                                                    {new Date(cert.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                                                    <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center"><Clock className="w-3 h-3" /></div>
                                                    {Math.floor((new Date() - new Date(cert.createdAt)) / (1000 * 60 * 60 * 24))} days in queue
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => openPreview(cert)}
                                                    className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-black text-gray-600 tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                                                >
                                                    EXPLORE
                                                </button>
                                                <button 
                                                    onClick={() => openActionModal(cert._id, 'approve')}
                                                    className="bg-emerald-600 px-4 py-2 rounded-xl text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-[0_4px_12px_rgb(16,185,129,0.3)] hover:-translate-y-0.5"
                                                >
                                                    APPROVE
                                                </button>
                                                <button 
                                                    onClick={() => openActionModal(cert._id, 'reject')}
                                                    className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-600 hover:text-white transition-all hover:-translate-y-0.5"
                                                >
                                                    REJECT
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Background History Placeholder */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-lg">Action History Logs</h4>
                        <p className="text-sm font-medium text-gray-500 mt-1">Review executive decisions and authorizations from the past 30 days.</p>
                    </div>
                </div>
                <button className="px-6 py-3 border-2 border-gray-100 rounded-2xl text-xs font-black tracking-widest text-gray-600 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all w-full md:w-auto text-center">
                    ACCESS LOGS
                </button>
            </div>

            {/* Action Modal */}
            {actionModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-10 border border-gray-100 transform transition-all animate-in zoom-in duration-200">
                        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-8 mx-auto ${actionModal.action === 'approve' ? 'bg-emerald-600 text-white shadow-[0_8px_20px_rgb(16,185,129,0.3)]' : 'bg-rose-600 text-white shadow-[0_8px_20px_rgb(225,29,72,0.3)]'}`}>
                            {actionModal.action === 'approve' ? <ShieldCheck className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                        </div>
                        
                        <h3 className="text-3xl font-black text-gray-900 mb-2 text-center tracking-tight">
                            {actionModal.action === 'approve' ? 'Authorize Approval' : 'Decline Request'}
                        </h3>
                        <p className="text-gray-500 mb-8 text-center px-4 font-medium leading-relaxed">
                            You are performing an executive action. This will finalize the status of the certificate and notify all stakeholders.
                        </p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[2px]">
                                Executive Note
                            </label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-gray-900 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder-gray-400 font-medium resize-none shadow-inner"
                                rows="4"
                                placeholder={actionModal.action === 'approve' ? 'Final remarks (e.g. Approved by HOD Office)' : 'Specify detailed reason for institutional rejection...'}
                            ></textarea>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setActionModal({ show: false, id: null, action: '' })}
                                className="w-full sm:flex-1 px-5 py-4 text-gray-500 font-black hover:bg-gray-100 rounded-2xl transition-colors tracking-widest text-xs"
                            >
                                BACK
                            </button>
                            <button
                                onClick={handleAction}
                                className={`w-full sm:flex-[2] px-5 py-4 text-white rounded-2xl font-black tracking-widest text-xs shadow-xl transition-all active:scale-95 ${
                                    actionModal.action === 'approve' 
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30' 
                                    : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30'}`}
                            >
                                CONFIRM {actionModal.action.toUpperCase()}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewModal.show && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 z-[100]">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-7xl h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-start bg-white z-10 relative">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-3xl border border-indigo-100 shadow-inner">
                                    {(previewModal.cert.studentName || previewModal.cert.studentId?.name || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter mb-1">{previewModal.cert.studentName || previewModal.cert.studentId?.name}</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-indigo-700 font-bold flex items-center gap-1.5 text-xs bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-100/50">
                                            <Award className="w-4 h-4" /> {previewModal.cert.companyName}
                                        </span>
                                        <span className="text-gray-500 text-xs font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                            <History className="w-4 h-4" /> {new Date(previewModal.cert.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPreviewModal({ show: false, cert: null })}
                                className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all absolute top-6 right-6 md:top-8 md:right-8"
                            >
                                <XCircle className="w-8 h-8" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-slate-100 relative shadow-inner">
                            <PDFViewer pdfPath={previewModal.cert.pdfPath} title={previewModal.cert.companyName} />
                        </div>
                        <div className="p-6 md:p-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white z-10">
                            <div className="w-full sm:w-auto">
                               <a 
                                 href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${previewModal.cert.pdfPath}`}
                                 target="_blank"
                                 className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-gray-600 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-xs tracking-widest w-full"
                               >
                                 <Download className="w-5 h-5" /> FULL DOWNLOAD
                               </a>
                            </div>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button 
                                    onClick={() => {
                                        setPreviewModal({ show: false, cert: null });
                                        openActionModal(previewModal.cert._id, 'reject');
                                    }}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-rose-50 text-rose-600 font-black tracking-widest text-xs rounded-2xl hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-rose-100/50"
                                >
                                    <XCircle className="w-5 h-5" /> DECLINE
                                </button>
                                <button 
                                    onClick={() => {
                                        setPreviewModal({ show: false, cert: null });
                                        openActionModal(previewModal.cert._id, 'approve');
                                    }}
                                    className="flex-[2] sm:flex-none px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black tracking-widest text-xs rounded-2xl shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck className="w-5 h-5" /> AUTHORIZE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default HodDashboard;
