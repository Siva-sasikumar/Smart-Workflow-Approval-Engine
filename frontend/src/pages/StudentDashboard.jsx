import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { certAPI } from '../services/api';
import { 
    Upload, FileText, CheckCircle, XCircle, Clock, 
    Loader, AlertCircle, Calendar, Search, Filter, 
    ArrowUpDown, ChevronRight, BarChart3, PieChart as PieChartIcon,
    ExternalLink
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie
} from 'recharts';

const StudentDashboard = ({ view = 'dashboard' }) => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    
    const [uploadData, setUploadData] = useState({
        companyName: '',
        duration: '',
        description: '',
        file: null
    });
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await certAPI.getMyCertificates();
            setCertificates(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setUploadData({ ...uploadData, file: e.target.files[0] });
    };

    const handleInputChange = (e) => {
        setUploadData({ ...uploadData, [e.target.name]: e.target.value });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        setMsg('');

        if (!uploadData.file) {
            setMsg('Please select a file');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('certificate', uploadData.file);
        formData.append('companyName', uploadData.companyName);
        formData.append('duration', uploadData.duration);
        formData.append('description', uploadData.description);

        try {
            await certAPI.upload(formData);
            setShowUploadModal(false);
            setUploadData({ companyName: '', duration: '', description: '', file: null });
            fetchCertificates();
            setUploading(false);
        } catch (err) {
            setMsg(err.response?.data?.msg || 'Upload failed');
            setUploading(false);
        }
    };

    // Analytics Data
    const analyticsData = useMemo(() => {
        const stats = {
            total: certificates.length,
            pending: certificates.filter(c => c.status === 'pending').length,
            approved: certificates.filter(c => c.status === 'approved').length,
            rejected: certificates.filter(c => c.status === 'rejected').length
        };

        const pieData = [
            { name: 'Approved', value: stats.approved, color: '#22c55e' },
            { name: 'Pending', value: stats.pending, color: '#eab308' },
            { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
        ].filter(d => d.value > 0);

        // Group by month for bar chart
        const monthlyData = {};
        certificates.forEach(c => {
            const date = new Date(c.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });

        const barData = Object.keys(monthlyData).map(month => ({
            name: month,
            uploads: monthlyData[month]
        }));

        return { stats, pieData, barData };
    }, [certificates]);

    // Filtered and Sorted Certificates
    const filteredCertificates = useMemo(() => {
        return certificates
            .filter(c => {
                const matchesSearch = c.companyName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                if (sortBy === 'company') return a.companyName.localeCompare(b.companyName);
                return 0;
            });
    }, [certificates, searchTerm, statusFilter, sortBy]);

    return (
        <Layout role="student">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -z-10"></div>
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tight">
                        {view === 'dashboard' ? 'Internship Overview' : 'Document Vault'}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-lg">
                        {view === 'dashboard' ? 'Track your progress and institutional statistics' : 'Manage and view your securely uploaded certificates'}
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="group flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.4)] font-black uppercase tracking-widest text-sm active:scale-95 hover:-translate-y-1"
                >
                    <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    Submit Document
                </button>
            </div>

            {view === 'dashboard' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { title: 'Total Submissions', value: analyticsData.stats.total, icon: FileText, bg: 'bg-indigo-500', glow: 'shadow-indigo-500/30' },
                            { title: 'Pending Review', value: analyticsData.stats.pending, icon: Clock, bg: 'bg-amber-500', glow: 'shadow-amber-500/30' },
                            { title: 'Verified Docs', value: analyticsData.stats.approved, icon: CheckCircle, bg: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
                            { title: 'Action Required', value: analyticsData.stats.rejected, icon: XCircle, bg: 'bg-rose-500', glow: 'shadow-rose-500/30' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl text-white ${stat.bg} shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-7 h-7" />
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-gray-900 drop-shadow-sm">{stat.value}</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">{stat.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl"><BarChart3 className="w-5 h-5 text-indigo-600" /></div>
                                Uploads Frequency
                            </h3>
                            <div className="h-[280px] w-full">
                                {analyticsData.barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analyticsData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                                            <Tooltip 
                                                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontWeight: 'bold'}}
                                                cursor={{fill: '#f8fafc'}}
                                            />
                                            <Bar dataKey="uploads" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={32}>
                                                {analyticsData.barData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#colorUv${index})`} />
                                                ))}
                                            </Bar>
                                            <defs>
                                                {analyticsData.barData.map((entry, index) => (
                                                <linearGradient id={`colorUv${index}`} x1="0" y1="0" x2="0" y2="1" key={index}>
                                                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                                                </linearGradient>
                                                ))}
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
                                        <span className="font-medium ml-2">No activity log available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-xl"><PieChartIcon className="w-5 h-5 text-purple-600" /></div>
                                Status Distribution
                            </h3>
                            <div className="h-[280px] w-full relative">
                                {analyticsData.pieData.length > 0 ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                            <span className="text-4xl font-black text-gray-900">{analyticsData.stats.total}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Logs</span>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analyticsData.pieData}
                                                    innerRadius={85}
                                                    outerRadius={110}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius={6}
                                                >
                                                    {analyticsData.pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm hover:opacity-80 transition-opacity" />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <PieChartIcon className="w-8 h-8 text-gray-300 mb-2" />
                                        <span className="font-medium ml-2">No distribution data</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Certificates Table Section */}
            {view === 'vault' && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden mb-8">
                    <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 flex flex-col md:flex-row justify-between gap-6 items-center">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Certificate Registry</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Manage and track your submitted documents</p>
                        </div>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all w-full md:w-64 outline-none shadow-sm"
                                />
                            </div>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="company">Company Name</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                <p className="text-indigo-900 font-bold uppercase tracking-widest text-xs">Loading Vault Data...</p>
                            </div>
                        ) : filteredCertificates.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <FileText className="w-10 h-10 text-indigo-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No certificates found</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto">We couldn't find any documents matching your current filters. Try adjusting your search criteria.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/30">
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Company Context</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Duration Info</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Submission Date</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Action Status</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[2px] text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCertificates.map((cert) => (
                                        <tr key={cert._id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-gray-900 text-base">{cert.companyName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-semibold text-gray-600">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> {cert.duration}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-semibold text-gray-500">{new Date(cert.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-2 relative group max-w-xs">
                                                    <div className={`w-fit inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm
                                                        ${cert.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            cert.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${cert.status === 'approved' ? 'bg-emerald-500' : cert.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                                        {cert.status === 'pending' ? (
                                                            cert.stage === 'faculty_review' ? 'Faculty Review' : 'HOD Review'
                                                        ) : cert.status}
                                                    </div>
                                                    {cert.remarks && cert.remarks.length > 0 && (
                                                        <div className="text-[11px] font-medium text-gray-500 leading-tight">
                                                            <span className="font-bold text-gray-400">Note: </span>
                                                            <span className="italic">"{cert.remarks[cert.remarks.length - 1].comment}"</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <a 
                                                        href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${cert.pdfPath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                                                        title="Quick View PDF"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <Link 
                                                        to={`/certificate/${cert._id}`}
                                                        className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-1 group/btn"
                                                        title="View Details"
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:block delay-75 group-hover/btn:text-indigo-600">Details</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full p-10 transform transition-all border border-white/20 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Submit Document</h3>
                                <p className="text-gray-500 font-medium mt-1 text-sm">Upload your internship certificate for institutional review</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                <XCircle className="w-7 h-7" />
                            </button>
                        </div>

                        {msg && <div className="mb-8 p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm border border-rose-100 font-bold flex items-center gap-3 animate-shake"><AlertCircle className="w-5 h-5" />{msg}</div>}

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Company / Organization Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    value={uploadData.companyName}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 text-lg font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none placeholder-gray-400"
                                    placeholder="e.g. Microsoft Corporation"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Internship Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    required
                                    value={uploadData.duration}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 text-lg font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none placeholder-gray-400"
                                    placeholder="e.g. 01 Jan 2024 - 31 Mar 2024"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Project Description (Optional)</label>
                                <textarea
                                    name="description"
                                    value={uploadData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 text-base font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none placeholder-gray-400 resize-none"
                                    rows="3"
                                    placeholder="Briefly describe your role and key learnings..."
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Document File (.pdf)</label>
                                <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group relative overflow-hidden ${uploadData.file ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/50'}`}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        required
                                    />
                                    <div className="pointer-events-none relative z-0 flex flex-col items-center">
                                        <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${uploadData.file ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                            {uploadData.file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />}
                                        </div>
                                        <p className={`text-base font-black truncate max-w-xs ${uploadData.file ? 'text-emerald-700' : 'text-gray-900'}`}>
                                            {uploadData.file ? uploadData.file.name : 'Click to select or drag PDF here'}
                                        </p>
                                        {!uploadData.file && <p className="text-sm font-medium text-gray-400 mt-2">Maximum file size: 5MB</p>}
                                        {uploadData.file && <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mt-2">Ready to upload</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.4)] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-3 text-sm"
                                >
                                    {uploading ? <><Loader className="w-5 h-5 animate-spin" /> Processing Upload...</> : 'Submit Document For Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default StudentDashboard;
