import {
    AlertTriangle,
    CheckCircle2,
    Activity,
    Users,
    Lightbulb,
    AlertOctagon,
    TrendingUp,
    MapPin
} from 'lucide-react';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import { useLocations } from '../../shared/context/LocationContext';
import { DashboardMapSection } from '../../shared/components/DashboardMapSection';
import { DashboardStatsSection } from '../../shared/components/DashboardStatsSection';
import React from 'react';
import { incidentService } from '../../shared/services/incidentService';

const Dashboard = () => {
    const { locations } = useLocations();

    // Default Empty Data
    const heatmapData: any[] = [];
    const incidentsPerArea: any[] = [];
    const incidentTrend: any[] = [];
    const inactiveZones: any[] = [];

    // Real Data State
    const [stats, setStats] = React.useState<{ title: string; value: string | number; change: string; trend: 'up' | 'down'; icon: any; color: string; bg: string; }[]>([
        { title: 'Total Incidents', value: '-', change: '...', trend: 'up', icon: AlertTriangle, color: 'text-hazard-600', bg: 'bg-hazard-50' },
        { title: 'Active Issues', value: '-', change: '...', trend: 'down', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Safety Score', value: '-', change: '...', trend: 'up', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Active Users', value: '-', change: '...', trend: 'up', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
    ]);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const incidents = await incidentService.getIncidents();
                const total = incidents.length;
                const active = incidents.filter(i => i.status !== 'Resolved').length;
                // Simple score calculation based on active incidents
                const score = Math.max(0, 100 - (active * 5));

                setStats([
                    { title: 'Total Incidents', value: total.toString(), change: '+0%', trend: 'up', icon: AlertTriangle, color: 'text-hazard-600', bg: 'bg-hazard-50' },
                    { title: 'Active Issues', value: active.toString(), change: '+0%', trend: 'down', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Safety Score', value: `${score}%`, change: '+0%', trend: 'up', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { title: 'Active Users', value: '27', change: '+0%', trend: 'up', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
                ]);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">

            {/* SECTION 1: STATS GRID */}
            <DashboardStatsSection stats={stats} />

            {/* SECTION 2: MAP & INCIDENTS BY AREA (Side-by-Side) */}
            <DashboardMapSection
                locations={locations}
                getMapStats={(loc) => {
                    // Try to match stats by name, fallback to 0
                    const stats = heatmapData.find(d => d.area === loc.name) || { high: 0, medium: 0, low: 0 };
                    return {
                        total: stats.high + stats.medium + stats.low,
                        high: stats.high,
                        medium: stats.medium,
                        low: stats.low
                    };
                }}
                chartData={locations.filter(l => l.active).map(loc => {
                    const stat = incidentsPerArea.find(s => s.name === loc.name);
                    return {
                        name: loc.name,
                        count: stat ? stat.count : 0
                    };
                })}
                period="Last 7 Days"
            />

            {/* SECTION 3: ANALYTICS INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Insight: Improvement (Blue Family) */}
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #93c5fd 50%, #dbeafe 100%)',
                    borderRadius: '0.75rem', padding: '1.5rem', color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Lightbulb size={20} color="#fde047" />
                            <h3 className="font-bold">Insight: Improvement</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>Incident reporting has improved due to new SOP implementation.</p>
                    </div>
                    <TrendingUp size={128} style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', color: 'white', opacity: 0.1 }} />
                </div>

                {/* Action Required (Amber/Red Family -> Let's use Red for Action) */}
                <div style={{
                    background: 'linear-gradient(135deg, #f87171 0%, #fee2e2 50%, #fef2f2 100%)',
                    borderRadius: '0.75rem', padding: '1.5rem',
                    color: '#991b1b', // Red-800
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <AlertOctagon size={20} color="#b91c1c" />
                            <h3 className="font-bold">Action Required</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Check sensor connectivity in inactive zones.</p>
                    </div>
                    <MapPin size={128} style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', color: '#b91c1c', opacity: 0.1 }} />
                </div>

                <div className="card flex-shadow">
                    <h3 className="font-bold text-slate-800" style={{ marginBottom: '0.75rem' }}>Inactive Reporting Zones</h3>
                    <div className="space-y-3">
                        {inactiveZones.length > 0 ? inactiveZones.map(zone => (
                            <div key={zone.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <span className="font-medium text-slate-500">{zone.name}</span>
                                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '0.5rem', fontSize: '0.75rem' }}>{zone.lastReport}</span>
                            </div>
                        )) : <div className="text-sm text-slate-500 py-2">No inactive zones reported.</div>}
                    </div>
                </div>
            </div>

            {/* SECTION 4: REMAINING CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Trend Chart (Line/Area) */}
                <div className="card flex-shadow">
                    <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1.5rem' }}>Incident Trend (7 Days)</h3>
                    <div style={{ height: '20rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={incidentTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="incidents" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncidents)" strokeWidth={3}>
                                    <LabelList dataKey="incidents" position="top" offset={10} style={{ fill: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }} />
                                </Area>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity Heatmap Table */}
                <div className="card flex-shadow">
                    <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1.5rem' }}>Severity Distribution </h3>
                    <div style={{ height: '20rem', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>AREA</th>
                                    <th style={{ padding: '0.5rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>HIGH</th>
                                    <th style={{ padding: '0.5rem', color: '#f97316', fontSize: '0.75rem', fontWeight: 700 }}>MED</th>
                                    <th style={{ padding: '0.5rem', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700 }}>LOW</th>
                                </tr>
                            </thead>
                            <tbody>
                                {heatmapData.length > 0 ? heatmapData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>{row.area}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ backgroundColor: row.high > 0 ? `rgba(239, 68, 68, ${0.2 + (row.high * 0.15)})` : '#f8fafc', color: row.high > 0 ? '#b91c1c' : '#cbd5e1', padding: '0.5rem', borderRadius: '0.375rem', fontWeight: 'bold' }}>
                                                {row.high}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ backgroundColor: row.medium > 0 ? `rgba(249, 115, 22, ${0.2 + (row.medium * 0.15)})` : '#f8fafc', color: row.medium > 0 ? '#c2410c' : '#cbd5e1', padding: '0.5rem', borderRadius: '0.375rem', fontWeight: 'bold' }}>
                                                {row.medium}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ backgroundColor: row.low > 0 ? `rgba(59, 130, 246, ${0.2 + (row.low * 0.15)})` : '#f8fafc', color: row.low > 0 ? '#1d4ed8' : '#cbd5e1', padding: '0.5rem', borderRadius: '0.375rem', fontWeight: 'bold' }}>
                                                {row.low}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-slate-500 text-sm">No severity data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default Dashboard;
