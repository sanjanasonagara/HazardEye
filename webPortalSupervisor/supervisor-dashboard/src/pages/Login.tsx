import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Adjust the URL if your auth endpoint is different
            const response = await axios.post('http://localhost:5200/api/auth/login', {
                email,
                password
            });

            const { token, role } = response.data;

            // Basic role check
            if (role !== 'SafetyOfficer' && role !== 'Admin') {
                setError('Unauthorized access. Supervisor role required.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            navigate('/');
        } catch (err: any) {
            console.error('Login failed', err);
            setError(err.response?.data?.message || 'Invalid credentials or server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-900 p-3 rounded-full">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Supervisor Login</h2>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="supervisor@hazardeye.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 transition-colors font-medium disabled:opacity-70"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <div className="mt-4 text-center text-xs text-gray-500">
                    <p>Demo Account: safety@hazardeye.com / Password123!</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
