import React from 'react';
import { Incident } from '../../types';
import { useLocations } from '../../../shared/context/LocationContext';
import { IncidentMap } from '../../../shared/components/IncidentMap';
import { IncidentChart } from '../../../shared/components/IncidentChart';

interface IncidentAreaChartProps {
  incidents: Incident[];
}

export const IncidentAreaChart: React.FC<IncidentAreaChartProps> = ({ incidents }) => {
  const { locations } = useLocations();

  // Group incidents by area + plant for the chart (preserve existing logic)
  const areaPlantCounts = incidents.reduce((acc, incident) => {
    const key = `${incident.area} - ${incident.plant}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(areaPlantCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Aggregate by area only for the map view
  const areaCounts = incidents.reduce((acc, incident) => {
    const key = incident.area;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);




  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Map (Admin style wrapper) */}
      <div className="card flex-shadow" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <h3 className="text-lg font-bold text-slate-800" style={{ marginBottom: '1rem' }}>Live Incident Map</h3>
        <div style={{ height: '24rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <IncidentMap
            locations={locations}
            getStats={(loc) => ({
              total: areaCounts[loc.name] || 0
            })}
            compactTooltip={false}
            showPopup={true}
            height="100%"
          />
        </div>
      </div>

      {/* Bar Chart (Admin style wrapper) */}
      <div className="card flex-shadow" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h3 className="text-lg font-bold text-slate-800">Incidents Overview by Area</h3>
          <select className="custom-select" style={{
            padding: '0.5rem 2rem 0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontSize: '0.875rem',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer'
          }}>
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
