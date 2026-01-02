import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Incident } from '../../types';

interface RepeatIncidentsChartProps {
  incidents: Incident[];
}

export const RepeatIncidentsChart: React.FC<RepeatIncidentsChartProps> = ({ incidents }) => {
  const [view, setView] = useState<'area' | 'type'>('area');

  const categorizeIncidentType = (incident: Incident): string => {
    const text = `${incident.description}`.toLowerCase();

    if (text.includes('corrosion')) return 'Corrosion';
    if (text.includes('leak') || text.includes('pipe')) return 'Pipe Leakage';
    if (text.includes('electrical') || text.includes('wiring') || text.includes('circuit')) {
      return 'Electrical Fault';
    }
    if (text.includes('fire') || text.includes('extinguisher')) return 'Fire Hazard';
    if (text.includes('spill') || text.includes('chemical')) return 'Chemical Spill';
    if (text.includes('ventilation') || text.includes('air')) return 'Air / Ventilation';
    if (
      text.includes('trip') ||
      text.includes('slip') ||
      text.includes('floor') ||
      text.includes('grating')
    ) {
      return 'Slip / Trip';
    }

    return 'Other';
  };

  // Existing area-based repeat risk (kept intact, just memoized)
  const repeatDataByArea = useMemo(() => {
    const areaIncidents: Record<string, Incident[]> = {};

    incidents.forEach((incident) => {
      const key = `${incident.area} - ${incident.plant}`;
      if (!areaIncidents[key]) {
        areaIncidents[key] = [];
      }
      areaIncidents[key].push(incident);
    });

    return Object.entries(areaIncidents)
      .filter(([, incs]) => incs.length >= 2)
      .map(([area, incs]) => ({
        area: area.length > 25 ? `${area.substring(0, 25)}...` : area,
        fullArea: area,
        count: incs.length,
        riskLevel: incs.length >= 5 ? 'High' : incs.length >= 3 ? 'Medium' : 'Low',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [incidents]);

  // New repeat incidents by incident type
  const repeatDataByType = useMemo(() => {
    const typeCounts: Record<string, number> = {};

    incidents.forEach((incident) => {
      const type = categorizeIncidentType(incident);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const getColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return '#dc2626';
      case 'Medium':
        return '#f59e0b';
      default:
        return '#22c55e';
    }
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => setView('area')}
          className={`px-3 py-1 rounded-full transition-colors ${view === 'area' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
        >
          By Area
        </button>
        <button
          type="button"
          onClick={() => setView('type')}
          className={`px-3 py-1 rounded-full transition-colors ${view === 'type' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
        >
          By Incident Type
        </button>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'type' ? (
            <BarChart data={repeatDataByType} margin={{ top: 10, right: 24, left: 8, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="type"
                angle={-35}
                textAnchor="end"
                height={72}
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                formatter={(value: number) => [
                  `${value} repeat incident${value !== 1 ? 's' : ''}`,
// @ts-ignore
                  'Count',
                ]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#3b82f6">
                {repeatDataByType.map((entry, index) => (
                  <Cell key={entry.type} fill={index === 0 ? '#1d4ed8' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={repeatDataByArea}
              margin={{ top: 10, right: 24, left: 8, bottom: 56 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="area"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                formatter={(value: number, _name: string, props: any) => [
                  `${value} incident${value !== 1 ? 's' : ''} (${props.payload.riskLevel} Risk)`,
// @ts-ignore
                  'Count',
                ]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {repeatDataByArea.map((entry) => (
                  <Cell key={entry.fullArea} fill={getColor(entry.riskLevel)} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};


