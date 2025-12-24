import React from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import { analyticsData, ioclGujaratRefineryPolygon } from '../data/mockData';
import { Lightbulb, AlertOctagon, TrendingUp, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default marker icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Analytics = () => {
    // Pie chart label render
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-xl font-bold text-slate-800">Safety & Hazard Analytics</h2>
                <p className="text-slate-500">Real-time data visualization and insights.</p>
            </div>

            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div style={{ background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', borderRadius: '0.75rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Lightbulb size={20} color="#fde047" />
                            <h3 className="font-bold">Insight: Improvement</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#dbeafe' }}>Incident reporting in "Refinery A" has improved by 15% due to new SOP implementation.</p>
                    </div>
                    <TrendingUp size={128} style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', color: 'white', opacity: 0.1 }} />
                </div>

                <div style={{ background: 'linear-gradient(to bottom right, #f97316, #ea580c)', borderRadius: '0.75rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <AlertOctagon size={20} color="white" />
                            <h3 className="font-bold">Action Required</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#ffedd5' }}>3 zones have been inactive for more than 7 days. Check sensor connectivity.</p>
                    </div>
                    <MapPin size={128} style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', color: 'white', opacity: 0.1 }} />
                </div>

                <div className="card">
                    <h3 className="font-bold text-slate-800" style={{ marginBottom: '0.75rem' }}>Inactive Reporting Zones</h3>
                    <div className="space-y-3">
                        {analyticsData.inactiveZones.map(zone => (
                            <div key={zone.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <span className="font-medium text-slate-500">{zone.name}</span>
                                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '0', fontSize: '0.75rem' }}>{zone.lastReport}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid of Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Trend Chart (Line) */}
                <div className="card">
                    <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1.5rem' }}>Incident Trend (7 Days)</h3>
                    <div style={{ height: '20rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData.incidentTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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

                {/* Severity Heatmap */}
                <div className="card">
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
                                {analyticsData.heatmapData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>{row.area}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ backgroundColor: row.high > 0 ? `rgba(239, 68, 68, ${0.2 + (row.high * 0.15)})` : '#f8fafc', color: row.high > 0 ? '#b91c1c' : '#cbd5e1', padding: '0.5rem', borderRadius: '0', fontWeight: 'bold' }}>
                                                {row.high}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ backgroundColor: row.medium > 0 ? `rgba(249, 115, 22, ${0.2 + (row.medium * 0.15)})` : '#f8fafc', color: row.medium > 0 ? '#c2410c' : '#cbd5e1', padding: '0.5rem', borderRadius: '0', fontWeight: 'bold' }}>
                                                {row.medium}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ backgroundColor: row.low > 0 ? `rgba(59, 130, 246, ${0.2 + (row.low * 0.15)})` : '#f8fafc', color: row.low > 0 ? '#1d4ed8' : '#cbd5e1', padding: '0.5rem', borderRadius: '0', fontWeight: 'bold' }}>
                                                {row.low}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Incidents by Area (Map & Chart) */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1.5rem' }}>Incidents by Area</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Map */}
                        <div style={{ height: '20rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <MapContainer center={[22.373, 73.112]} zoom={14} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Polygon pathOptions={{ color: 'blue', fillOpacity: 0.1 }} positions={ioclGujaratRefineryPolygon} />
                                {analyticsData.heatmapData.map((zone, idx) => {
                                    const totalReports = zone.high + zone.medium + zone.low;
                                    return (
                                        <Marker key={idx} position={[zone.lat, zone.lng]}>
                                            <MapTooltip permanent direction="top" offset={[0, -20]} className="font-bold text-slate-700">
                                                <div className="text-center">
                                                    <div className="text-sm font-bold">{zone.area}</div>
                                                    <div className="text-xs">Reports: {totalReports}</div>
                                                </div>
                                            </MapTooltip>
                                            <Popup>
                                                <div className="text-sm">
                                                    <strong className="block mb-1">{zone.area}</strong>
                                                    <div className="flex gap-2">
                                                        <span className="text-red-600 font-bold">H: {zone.high}</span>
                                                        <span className="text-orange-500 font-medium">M: {zone.medium}</span>
                                                        <span className="text-blue-500">L: {zone.low}</span>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </div>

                        {/* Bar Chart */}
                        <div style={{ height: '20rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.incidentsPerArea} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} dy={10} interval={0} angle={-45} textAnchor="end" height={60} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50}>
                                        <LabelList dataKey="count" position="top" style={{ fill: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
