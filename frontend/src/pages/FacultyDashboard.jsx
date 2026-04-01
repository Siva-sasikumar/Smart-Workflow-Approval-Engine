import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { certAPI } from '../services/api';
import { 
    CheckCircle, XCircle, Clock, FileText, User, UserCheck, 
    Search, Filter, Eye, Loader, AlertCircle, ChevronRight,
    ArrowUpDown, Info
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';

const FacultyDashboard = () => {
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
            const res = await certAPI.getFacultyPending();
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
                if (sortBy === 'name') {
                    const nameA = a.studentName || a.studentId?.name || '';
                    const nameB = b.studentName || b.studentId?.name || '';
                    return nameA.localeCompare(nameB);
                }
                return 0;
            });
    }, [certificates, searchTerm, sortBy]);

    return (
        <Layout role="faculty">
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 sm:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">Faculty Review Portal</h1>
                        <p className="text-indigo-200 font-medium text-lg max-w-xl border-l-4 border-indigo-400 pl-4">Verify and process student internship certificates efficiently.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex items-center gap-4 shadow-lg">
                        <div className="p-2 bg-yellow-400/20 rounded-xl"><Clock className="w-6 h-6 text-yellow-400" /></div>
                        <div>
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Pending</p>
                            <span className="text-white font-black text-2xl leading-none">{certificates.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-6 hover:-translate-y-1 transition-transform cursor-default group">
                    <div className="p-5 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Assigned</p>
                        <p className="text-4xl font-black text-gray-900">{certificates.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-6 hover:-translate-y-1 transition-transform cursor-default group">
                    <div className="p-5 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Immediate Action</p>
                        <p className="text-4xl font-black text-gray-900">
                            {certificates.filter(c => {
                                const days = (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
                                return days > 2;
                            }).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-6 hover:-translate-y-1 transition-transform cursor-default group">
                    <div className="p-5 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Waitlist Stage</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">Faculty Level</p>
                    </div>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                        Pending Approvals
                    </h2>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                        <div className="relative group w-full sm:w-auto">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search student or company..."
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
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Student Name</option>
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
                            <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <UserCheck className="w-12 h-12 text-indigo-600 relative z-10" />
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping"></div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Workload Clear!</h3>
                            <p className="text-gray-500 mt-2 font-medium">There are currently no certificates waiting for your review.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-[2px]">Student Details</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-[2px]">Company & Duration</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-[2px]">Submitted On</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-500 uppercase tracking-[2px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCertificates.map((cert) => (
                                    <tr key={cert._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-inner">
                                                    {(cert.studentName || cert.studentId?.name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{cert.studentName || cert.studentId?.name}</p>
                                                    <p className="text-xs font-medium text-gray-500">{cert.studentEmail || cert.studentId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-bold text-gray-800">{cert.companyName}</p>
                                            <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> {cert.duration}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-semibold text-gray-900">{new Date(cert.createdAt).toLocaleDateString()}</p>
                                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                {Math.floor((new Date() - new Date(cert.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openPreview(cert)}
                                                    className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                                                    title="Quick Preview"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => openActionModal(cert._id, 'approve')}
                                                    className="p-2.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => openActionModal(cert._id, 'reject')}
                                                    className="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition-all"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
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

            {/* Action Modal */}
            {actionModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className={`p-4 rounded-2xl w-fit mb-6 shadow-inner ${actionModal.action === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {actionModal.action === 'approve' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                            {actionModal.action === 'approve' ? 'Approve Certificate?' : 'Reject Certificate?'}
                        </h3>
                        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                            {actionModal.action === 'approve' 
                                ? 'This will verify the document and forward it to the HOD for final institutional approval.' 
                                : 'Please provide a reason for rejecting this document. It will be returned to the student.'}
                        </p>

                        <div className="mb-8">
                            <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-[2px]">
                                {actionModal.action === 'approve' ? 'Remarks (Optional)' : 'Rejection Reason (Required)'}
                            </label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium resize-none"
                                rows="3"
                                placeholder={actionModal.action === 'approve' ? 'Add any feedback for the HOD...' : 'e.g. Invalid document format or unclear details...'}
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setActionModal({ show: false, id: null, action: '' })}
                                className="flex-1 px-5 py-4 text-gray-600 hover:bg-gray-100 rounded-2xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                className={`flex-1 px-5 py-4 text-white rounded-2xl font-black tracking-wide uppercase transition-all active:scale-95 shadow-lg ${
                                    actionModal.action === 'approve' 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' 
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewModal.show && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 z-[100]">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">{previewModal.cert.studentName || previewModal.cert.studentId?.name}</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-0.5">{previewModal.cert.companyName} Internship</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPreviewModal({ show: false, cert: null })}
                                className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-gray-100 relative">
                            <PDFViewer pdfPath={previewModal.cert.pdfPath} title={previewModal.cert.companyName} />
                        </div>
                        <div className="p-6 md:px-8 border-t border-gray-100 flex flex-wrap justify-end gap-3 bg-white z-10">
                            <button 
                                onClick={() => setPreviewModal({ show: false, cert: null })}
                                className="px-8 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                            >
                                Close View
                            </button>
                            <button 
                                onClick={() => {
                                    setPreviewModal({ show: false, cert: null });
                                    openActionModal(previewModal.cert._id, 'reject');
                                }}
                                className="px-8 py-3.5 bg-rose-50 text-rose-600 font-black rounded-2xl hover:bg-rose-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <XCircle className="w-5 h-5" /> Reject
                            </button>
                            <button 
                                onClick={() => {
                                    setPreviewModal({ show: false, cert: null });
                                    openActionModal(previewModal.cert._id, 'approve');
                                }}
                                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" /> Approve Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default FacultyDashboard;
