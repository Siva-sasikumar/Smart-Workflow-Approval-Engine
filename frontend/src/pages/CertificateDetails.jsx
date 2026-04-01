import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { certAPI } from '../services/api';
import Timeline from '../components/Timeline';
import PDFViewer from '../components/PDFViewer';
import { ChevronLeft, Calendar, Building2, Clock, Mail, User, ShieldCheck, AlertCircle, Loader, Award, CheckCircle, Search, Download, FileText } from 'lucide-react';

const CertificateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCertificateDetails();
    }, [id]);

    const fetchCertificateDetails = async () => {
        try {
            setLoading(true);
            // Since there is no single GET endpoint, we fetch all and filter
            // This is a workaround to avoid backend changes as requested
            const res = await certAPI.getMyCertificates();
            const found = res.data.data.find(c => c._id === id);
            
            if (found) {
                setCertificate(found);
            } else {
                // Try faculty pending if not found in student
                const facRes = await certAPI.getFacultyPending();
                const facFound = facRes.data.data.find(c => c._id === id);
                if (facFound) {
                    setCertificate(facFound);
                } else {
                    // Try HOD pending
                    const hodRes = await certAPI.getHodPending();
                    const hodFound = hodRes.data.data.find(c => c._id === id);
                    if (hodFound) {
                        setCertificate(hodFound);
                    } else {
                        setError('Certificate not found');
                    }
                }
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch certificate details');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-500 font-medium">Loading certificate details...</p>
                </div>
            </Layout>
        );
    }

    if (error || !certificate) {
        return (
            <Layout>
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{error || 'Something went wrong'}</h2>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 group bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm w-fit"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    BACK TO HUB
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex items-center gap-6 relative z-10">
                         <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200">
                             {(certificate.studentName || '?')[0].toUpperCase()}
                         </div>
                         <div>
                             <div className="flex items-center gap-3 mb-1">
                                 <h1 className="text-3xl font-black text-gray-900 tracking-tight">{certificate.companyName} Certificate</h1>
                                 <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1 border
                                     ${certificate.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                     certificate.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                     'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                     {certificate.status === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> : 
                                      certificate.status === 'rejected' ? <AlertCircle className="w-3.5 h-3.5" /> : 
                                      <Clock className="w-3.5 h-3.5" />}
                                     {certificate.status}
                                 </div>
                             </div>
                             <p className="text-gray-500 flex items-center gap-2 font-medium">
                                 <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tracking ID</span> 
                                 <span className="bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-600 border border-gray-100">{certificate._id}</span>
                             </p>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Timeline */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Information Card */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                            <User className="w-32 h-32 text-indigo-900" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 relative z-10">
                             <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                <Award className="w-5 h-5" />
                             </div>
                             Candidate Intel
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-indigo-50 transition-colors"><User className="w-4 h-4 text-gray-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Primary Name</p>
                                    <p className="text-gray-900 font-bold text-lg">{certificate.studentName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100"><Mail className="w-4 h-4 text-gray-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Contact Email</p>
                                    <p className="text-gray-900 font-bold text-sm">{certificate.studentEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100"><Building2 className="w-4 h-4 text-gray-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Organization</p>
                                    <p className="text-gray-900 font-bold text-sm">{certificate.companyName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100"><Clock className="w-4 h-4 text-gray-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Tenure</p>
                                    <p className="text-gray-900 font-bold text-sm">{certificate.duration}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100"><Calendar className="w-4 h-4 text-gray-500" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-0.5">Submission Date</p>
                                    <p className="text-gray-900 font-bold text-sm">{new Date(certificate.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                             <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                <ShieldCheck className="w-5 h-5" />
                             </div>
                             Approval Journey
                        </h3>
                        <Timeline stage={certificate.stage} status={certificate.status} remarks={certificate.remarks} />
                    </div>
                </div>

                {/* Right Column: PDF Preview */}
                <div className="lg:col-span-2 flex flex-col h-full min-h-[600px] bg-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <h4 className="font-bold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> Document Preview</h4>
                         <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${certificate.pdfPath}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black tracking-widest hover:bg-indigo-100 transition-colors">
                            <Download className="w-4 h-4" /> SECURE DOWNLOAD
                         </a>
                    </div>
                    <div className="flex-1 w-full h-full">
                        <PDFViewer pdfPath={certificate.pdfPath} title={`${certificate.companyName} Certificate`} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CertificateDetails;
