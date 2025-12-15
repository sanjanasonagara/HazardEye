import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import ActivityChart from '../components/ActivityChart';
import IncidentList from '../components/IncidentList'; // Reusing or refactoring appropriately
import { AlertTriangle, CheckCircle, Clock, BarChart3, Bell } from 'lucide-react';

interface DashboardStats {
    totalIncidents: number;
    openIncidents: number;
    closedIncidents: number;
    criticalOpenIncidents: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/summary');
                setStats(response.data);
            } catch (err: any) {
                console.error('Error fetching dashboard stats:', err);
                if (err.response && err.response.status === 401) {
                    // Handled by interceptor, but good to be aware
                } else {
                    setError('Failed to load dashboard statistics.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    // Fallback UI for error - but keep structure so sidebars don't jump
    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Incidents"
                    value={stats?.totalIncidents || 0}
                    icon={BarChart3}
                    color="blue"
                    trend="+12%"
                />
                <StatsCard
                    title="Open Incidents"
                    value={stats?.openIncidents || 0}
                    icon={Clock}
                    color="orange"
                />
                <StatsCard
                    title="Critical Issues"
                    value={stats?.criticalOpenIncidents || 0}
                    icon={AlertTriangle}
                    color="red"
                />
                <StatsCard
                    title="Resolved Today"
                    value={stats?.closedIncidents || 0}
                    icon={CheckCircle}
                    color="green"
                    trend="+5%"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Start 2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Chart Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Incident Trends (Last 7 Days)</h2>
                        <ActivityChart />
                    </div>

                    {/* Recent Incidents Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Recent Incidents</h2>
                            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                        </div>
                        <div className="p-0">
                            {/* We can embed the list here, but let's constrain it slightly for "Widget" feel */}
                            <IncidentList />
                        </div>
                    </div>
                </div>

                {/* Right Column (Start 1/3) */}
                <div className="space-y-8">
                    {/* Tasks / Quick Actions or simple list */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-orange-400 mr-3 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Verify Safety Violation Case #{100 + i}</p>
                                        <p className="text-xs text-gray-500 mt-1">Assigned 2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-2 text-sm text-gray-600 font-medium hover:text-blue-600 border border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                + Assign New Task
                            </button>
                        </div>
                    </div>

                    {/* System Status or Team Availability */}
                    <div className="bg-slate-900 rounded-xl shadow-sm p-6 text-white">
                        <h2 className="text-lg font-bold mb-4">System Status</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Camera Feed Sync</span>
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">AI Model Latency</span>
                                <span className="text-sm font-mono">124ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Database Connection</span>
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">Stable</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
