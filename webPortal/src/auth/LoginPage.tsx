import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock Login removed to ensure real backend authentication is always used.

        try {
            const response = await fetch('http://localhost:5200/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Login failed');
            }

            const data = await response.json();
            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === 'Admin') {
                navigate('/admin');
            } else if (data.user.role === 'SafetyOfficer' || data.user.role === 'Supervisor') {
                navigate('/supervisor');
            } else {
                navigate('/employee');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            // Fallback for demo if API is down
            if (err.message.includes('Failed to fetch')) {
                setError('Backend unreachable. Try using "sarah.employee@hazardeeye.com" to trigger Mock Mode.');
            } else {
                setError(err.message || 'Invalid email or password');
            }
        } finally {
            if (!formData.email.includes('employee') && !formData.email.includes('admin') && !formData.email.includes('supervisor')) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative z-10 mx-4">

                {/* Left Side: Visual/Branding */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10 mb-8">
                            <Shield className="w-6 h-6 text-white" />
                            <span className="text-white font-bold tracking-tight">HazardEye AI</span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                            Secure your <br />
                            <span className="text-blue-200">industrial future.</span>
                        </h1>
                        <p className="text-blue-100/80 text-lg max-w-md leading-relaxed">
                            Join the world's most advanced AI-driven safety ecosystem. Monitor, report, and prevent hazards in real-time.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex -space-x-3 mb-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-slate-200 overflow-hidden shadow-lg">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                +2k
                            </div>
                        </div>
                        <p className="text-white/60 text-sm italic">
                            Trusted by 2,000+ safety officers worldwide.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-slate-900">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Plese enter your details to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm flex items-start gap-2">
                                <Shield className="w-5 h-5 text-red-400 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                    placeholder="name@company.com"
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
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                                />
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                            </label>
                            <button type="button" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-4 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white hover:bg-slate-800 transition-all active:scale-[0.98]">
                                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="google" className="w-5 h-5" />
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white hover:bg-slate-800 transition-all active:scale-[0.98]">
                                <Github className="w-5 h-5" />
                                <span className="text-sm font-medium">Github</span>
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-4">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Shield className="w-96 h-96 text-white" />
            </div>
        </div>
    );
};
