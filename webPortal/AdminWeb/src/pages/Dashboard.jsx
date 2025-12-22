import React from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Activity,
    Users,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { analyticsData, cmsContent } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const Dashboard = () => {
    // Mock KPIs
    const stats = [
        { title: 'Total Incidents', value: '42', change: '+12%', trend: 'up', icon: AlertTriangle, color: 'text-hazard-600', bg: 'bg-hazard-50' },
        { title: 'Active Issues', value: '5', change: '-2', trend: 'down', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Safety Score', value: '94%', change: '+1.5%', trend: 'up', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Active Users', value: '27', change: '+5', trend: 'up', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const isHazard = stat.bg === 'bg-hazard-50';
                    const isBlue = stat.bg === 'bg-blue-50';
                    const isGreen = stat.bg === 'bg-green-50';

                    let background = isHazard ? 'linear-gradient(to bottom right, #eb661fff, #f46726d8)' :
                        isBlue ? 'linear-gradient(to bottom right, #307af1ff, #6b97fdff)' :
                            isGreen ? 'linear-gradient(to bottom right, #08ec5cff, #026b29ff)' :
                                'white';

                    let textColor = background === 'white' ? 'var(--color-text-main)' : 'white';
                    let subTextColor = background === 'white' ? '#64748b' : 'rgba(255, 255, 255, 0.8)';
                    let iconBg = background === 'white' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.2)';
                    let iconColor = background === 'white' ? '#475569' : 'white';

                    return (
                        <div key={index} className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: background,
                            color: textColor,
                            border: 'none'
                        }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: subTextColor }}>{stat.title}</p>
                                    <h3 className="text-3xl font-bold" style={{ marginTop: '0.rem', color: textColor }}>{stat.value}</h3>
                                </div>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: '0',
                                }}>
                                    <stat.icon size={40} color={iconColor} />
                                </div>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight size={16} color={background === 'white' ? 'var(--color-success)' : 'white'} style={{ marginRight: '0.25rem' }} />
                                ) : (
                                    <ArrowDownRight size={16} color={background === 'white' ? 'var(--color-danger)' : 'white'} style={{ marginRight: '0.25rem' }} />
                                )}
                                <span style={{ fontWeight: 500, color: background === 'white' ? (stat.trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)') : 'white' }}>
                                    {stat.change}
                                </span>
                                <span style={{ marginLeft: '0.5rem', color: subTextColor, fontSize: '0.875rem' }}>vs last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 card">
                    <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                        <h3 className="text-lg font-bold text-slate-800">Incidents Overview</h3>
                        <select className="custom-select">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div style={{ height: '16rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.incidentsPerArea} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                    <LabelList dataKey="count" position="top" style={{ fill: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Cases */}
                <div className="card">
                    <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1rem' }}>Urgent Attention</h3>
                    <div className="space-y-4">
                        {analyticsData.inactiveZones.slice(0, 2).map((zone, idx) => (
                            <div key={`zone-${idx}`} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Activity size={20} color="#94a3b8" style={{ marginTop: '0.125rem' }} />
                                <div>
                                    <h4 className="text-sm font-medium text-slate-800">Inactive Zone: {zone.name}</h4>
                                    <p className="text-xs text-slate-500" style={{ marginTop: '0.25rem' }}>Last report: {zone.lastReport}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
