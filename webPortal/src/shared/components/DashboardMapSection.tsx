import React from 'react';
import { IncidentMap, LocationStats } from './IncidentMap';
import { IncidentChart, ChartDataPoint } from './IncidentChart';
import { Location } from '../types/Location';
import { IOCL_GUJARAT_REFINERY_POLYGON } from '../constants/config';

interface DashboardMapSectionProps {
    locations: Location[];
    getMapStats: (location: Location) => LocationStats;
    chartData: ChartDataPoint[];
    period?: string;
    onPeriodChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DashboardMapSection: React.FC<DashboardMapSectionProps> = ({
    locations,
    getMapStats,
    chartData,
    period = "Last 7 Days",
    onPeriodChange
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="card flex-shadow" style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1rem' }}>Live Incident Map</h3>
                <div style={{ height: '24rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <IncidentMap
                        locations={locations}
                        getStats={getMapStats}
                        showPopup={true}
                        compactTooltip={false}
                        height="100%"
                        backgroundPolygon={IOCL_GUJARAT_REFINERY_POLYGON as [number, number][]}
                    />
                </div>
            </div>

            {/* Incidents by Area Chart */}
            <div className="card flex-shadow" style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <h3 className="text-lg font-bold text-slate-800">Incidents Overview by Area</h3>
                    <select
                        className="custom-select"
                        value={period}
                        onChange={onPeriodChange}
                        style={{
                            padding: '0.5rem 2rem 0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div style={{ height: '24rem' }}>
                    <IncidentChart
                        data={chartData}
                        variant="admin"
                    />
                </div>
            </div>
        </div>
    );
};
