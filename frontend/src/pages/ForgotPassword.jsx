import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Mail, ChevronRight, CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLink, setResetLink] = useState('');
    const { forgotPassword } = useAuth();

    const onSubmit = async e => {
        e.preventDefault();
        setMsg('');
        setError('');
        setResetLink('');
        setLoading(true);

        const res = await forgotPassword(email);
        setLoading(false);

        if (res.success) {
            setMsg(res.msg);
            if (res.data?.resetLink) {
                setResetLink(res.data.resetLink);
            }
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden font-sans">
            {/* Left/Top Branding Section */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-12 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute -top-40 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                </div>
                
                <div className="relative z-10 w-full max-w-lg text-white">
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20 shadow-2xl">
                        <ShieldCheck className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
                        Account Recovery
                    </h1>
                    <p className="text-xl text-indigo-200 font-medium leading-relaxed mb-12">
                        Get back into your account securely to continue managing your workflow approvals.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <h3 className="text-3xl font-black text-white mb-2">24/7</h3>
                            <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Support Access</p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <h3 className="text-3xl font-black text-white mb-2">AES-256</h3>
                            <p className="text-sm font-bold text-purple-300 uppercase tracking-widest">Encryption</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right/Bottom Auth Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="lg:hidden mb-12">
                        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-2xl mb-6">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Internship Hub</h1>
                        <p className="text-gray-500 mt-2 font-medium">Smart Workflow Engine</p>
                    </div>

                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Forgot Password?</h2>
                        <p className="text-gray-500 mt-3 font-medium text-lg">No worries, we'll send you reset instructions securely.</p>
                    </div>

                    {msg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{msg}</span>
                            </div>
                            {resetLink && (
                                <div className="mt-4 p-4 bg-white/60 rounded-xl border border-emerald-100 break-all text-xs font-medium text-emerald-800">
                                    <p className="mb-2 uppercase tracking-widest font-black text-[10px] text-emerald-500">Dev Only Simulated Link:</p>
                                    <a href={resetLink} className="hover:underline text-indigo-600">{resetLink}</a>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6 mt-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-indigo-900 border-l-4 border-indigo-500 pl-2 uppercase tracking-[2px]">Registered Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 text-gray-400 transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-base font-semibold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none placeholder-gray-400"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
                        >
                            {loading ? 'Processing Request...' : 'Send Recovery Link'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link to="/login" className="text-indigo-600 font-bold hover:text-purple-600 transition-colors border-b-2 border-indigo-200 hover:border-purple-600 pb-1 inline-flex items-center gap-2 group cursor-pointer">
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Secure Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
