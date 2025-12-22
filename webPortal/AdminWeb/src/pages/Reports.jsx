import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const Reports = () => {
    const [selectedRange, setSelectedRange] = useState('Weekly');

    const reportTypes = [
        { name: 'Incident Summary', description: 'Detailed log of all reported incidents', format: 'PDF/CSV' },
        { name: 'Safety Compliance', description: 'SOP adherence and violation stats', format: 'PDF' },
        { name: 'User Activity', description: 'Login and session history logs', format: 'CSV' },
        { name: 'Maintenance Logs', description: 'Sensor repair and checkup logs', format: 'PDF/CSV' },
    ];

    return (
        <div className="space-y-6">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '0' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Generate Reports</h2>
                            <p className="text-sm text-slate-500">Select date range and format to download.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        {['Daily', 'Weekly', 'Monthly'].map(range => (
                            <button
                                key={range}
                                onClick={() => setSelectedRange(range)}
                                style={{
                                    padding: '0.375rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    borderRadius: '0',
                                    border: selectedRange === range ? '1px solid #e2e8f0' : 'none',
                                    backgroundColor: selectedRange === range ? 'white' : 'transparent',
                                    color: selectedRange === range ? '#1e293b' : '#64748b',
                                    boxShadow: selectedRange === range ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-sm font-medium" style={{ color: '#334155', display: 'block' }}>Custom Date Range</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="date" className="input-field" style={{ paddingLeft: '2.25rem' }} />
                            </div>
                            <span style={{ color: '#94a3b8' }}>to</span>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="date" className="input-field" style={{ paddingLeft: '2.25rem' }} />
                            </div>
                        </div>

                        <div style={{ paddingTop: '1rem' }}>
                            <h3 className="text-sm font-bold text-slate-800" style={{ marginBottom: '0.75rem' }}>Summary Preview ({selectedRange})</h3>
                            <div className="grid grid-cols-2" style={{ gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                    <p className="text-xs text-slate-500">Total Incidents</p>
                                    <p className="text-lg font-bold text-slate-800">24</p>
                                </div>
                                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                    <p className="text-xs text-slate-500">Resolved Cases</p>
                                    <p className="text-lg font-bold text-slate-800">18</p>
                                </div>
                                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                    <p className="text-xs text-slate-500">Avg. Response</p>
                                    <p className="text-lg font-bold text-slate-800">2h 15m</p>
                                </div>
                                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                    <p className="text-xs text-slate-500">Compliance Rate</p>
                                    <p className="text-lg font-bold text-success">98%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800">Available Reports</h3>
                        <div className="space-y-3">
                            {reportTypes.map((report, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', transition: 'background-color 0.2s' }} className="hover:bg-slate-50">
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#334155' }}>{report.name}</p>
                                        <p className="text-xs text-slate-500">{report.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                            <Download size={12} />
                                            <span>PDF</span>
                                        </button>
                                        <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                            <Download size={12} />
                                            <span>CSV</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
