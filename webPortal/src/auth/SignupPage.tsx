import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../shared/services/api';
import { Shield, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        company: '',
        phone: '',
        role: 'Employee'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step < 2) {
            // Step 1 Validation
            if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all fields.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters.');
                return;
            }
            setStep(step + 1);
            return;
        }

        if (step === 2) {
            if (!formData.employeeId) {
                setError('Employee ID is required.');
                return;
            }
            if (!/^EMP-[A-Z0-9]+$/.test(formData.employeeId)) {
                setError('Employee ID must match format EMP-XXXX (e.g., EMP-1234).');
                return;
            }
            if (!formData.company) {
                setError('Department is required.');
                return;
            }
            if (!formData.phone) {
                setError('Phone number is required.');
                return;
            }
        }

        setLoading(true);
        try {
            // Split name
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Map role - Default to Employee/Viewer since Role selection UI is removed
            const roleToSend = 'Viewer';

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    employeeId: formData.employeeId,
                    password: formData.password,
                    firstName,
                    lastName,
                    role: roleToSend,
                    company: formData.company,
                    phone: formData.phone
                }),
            });

            if (!response.ok) {
                const data = await response.json();

                // Enhanced Error Parsing for Backend 400
                let errorMessage = data.message || 'Registration failed';
                if (data.errors) {
                    // data.errors is likely { FieldName: ["Error 1"], ... }
                    const validationErrors = Object.values(data.errors).flat().join(', ');
                    errorMessage = `Validation failed: ${validationErrors}`;
                } else if (data.details) {
                    errorMessage = data.details; // Use detailed error if available (e.g., from 500 handler)
                } else if (typeof data === 'string') {
                    errorMessage = data; // Sometimes error is just a string
                }

                throw new Error(errorMessage);
            }

            // Success
            navigate('/login');
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans py-12">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative z-10 mx-4">

                {/* Left Side: Progress & Info */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10 mb-8">
                            <Shield className="w-6 h-6 text-white" />
                            <span className="text-white font-bold tracking-tight">HazardEye AI</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                            Safety starts <br />
                            <span className="text-blue-200">with you.</span>
                        </h1>
                        <p className="text-blue-100/80 text-lg max-w-md leading-relaxed mb-10">
                            Create your professional account to unlock AI-powered hazard detection and safety analytics.
                        </p>

                        <div className="space-y-6">
                            {[
                                { s: 1, t: 'Account Details', d: 'Enter your personal information' },
                                { s: 2, t: 'Work Context', d: 'Company and department info' }
                            ].map((item) => (
                                <div key={item.s} className={`flex items-start gap-4 transition-all ${step >= item.s ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg ${step > item.s ? 'bg-green-400 text-slate-900' : 'bg-white/20 text-white'}`}>
                                        {step > item.s ? <CheckCircle2 className="w-6 h-6" /> : item.s}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{item.t}</h3>
                                        <p className="text-blue-100/60 text-sm">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-lg">
                                <img src="https://i.pravatar.cc/150?u=supervisor" alt="testimony" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">"HazardEye changed our refinery's safety culture in weeks."</p>
                                <p className="text-blue-200 text-xs font-bold mt-1">— Mark Rivers, Chief Safety Officer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-slate-900">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400">Step {step} of 2 — {step === 1 ? 'Personal details' : 'Work information'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-start gap-2">
                                <Shield className="w-5 h-5 text-red-400 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {step === 1 ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Work Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="john@refinery.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="text-sm font-medium text-slate-300 ml-1">Work Context</label>
                                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl mb-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Employee ID <span className="text-red-400">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.employeeId}
                                                onChange={e => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:border-blue-500 outline-none"
                                                placeholder="EMP-XXXX"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Unique identifier. Cannot be changed later.</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Department</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.company}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full mt-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none"
                                                placeholder="e.g. Operations"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4 flex gap-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1 py-3.5 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] ${step === 1 ? 'w-full' : ''} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating Account...' : (step === 1 ? 'Next Step' : 'Create Account')}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-4">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute bottom-0 left-0 p-8 opacity-10 pointer-events-none">
                <CheckCircle2 className="w-64 h-64 text-white" />
            </div>
        </div >
    );
};
