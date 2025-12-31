import React from 'react';
import { Incident, Severity } from '../../types';

interface SeverityDistributionChartProps {
  incidents: Incident[];
}

export const SeverityDistributionChart: React.FC<SeverityDistributionChartProps> = ({ incidents }) => {
  // Group by area and severity
  const areaSeverityData: Record<string, Record<Severity, number>> = {};

  incidents.forEach(incident => {
    const area = `${incident.area} - ${incident.plant}`;
    if (!areaSeverityData[area]) {
      areaSeverityData[area] = { High: 0, Medium: 0, Low: 0 };
    }
    areaSeverityData[area][incident.severity]++;
  });

  const rows = Object.entries(areaSeverityData)
    .map(([area, severities]) => ({
      area,
      High: severities.High,
      Medium: severities.Medium,
      Low: severities.Low,
    }))
    .sort((a, b) => (b.High + b.Medium + b.Low) - (a.High + a.Medium + a.Low));

  const getCellStyle = (value: number, color: 'high' | 'medium' | 'low') => {
    const baseOpacity = 0.2;
    const intensityStep = 0.12;
    const opacity = value === 0 ? 0 : Math.min(baseOpacity + value * intensityStep, 0.9);

    let bgBase: string;
    let textColor: string;

    switch (color) {
      case 'high':
        bgBase = '239, 68, 68'; // red-500
        textColor = value > 0 ? '#b91c1c' : '#cbd5e1';
        break;
      case 'medium':
        bgBase = '249, 115, 22'; // orange-500
        textColor = value > 0 ? '#c2410c' : '#cbd5e1';
        break;
      default:
        bgBase = '59, 130, 246'; // blue-500
        textColor = value > 0 ? '#1d4ed8' : '#cbd5e1';
        break;
    }

    return {
      backgroundColor: value > 0 ? `rgba(${bgBase}, ${opacity})` : '#f8fafc',
      color: textColor,
      padding: '0.5rem',
      borderRadius: '0.25rem',
      fontWeight: 700,
      fontSize: '0.875rem',
    };
  };

  if (rows.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm">No severity data available</p>
      </div>
    );
  }

  return (
    <div className="h-80 overflow-auto">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr>
            <th className="text-left px-2 py-2 text-[0.75rem] font-bold tracking-wide text-slate-500">
              AREA
            </th>
            <th className="px-2 py-2 text-[0.75rem] font-bold tracking-wide text-red-500">HIGH</th>
            <th className="px-2 py-2 text-[0.75rem] font-bold tracking-wide text-orange-500">
              MED
            </th>
            <th className="px-2 py-2 text-[0.75rem] font-bold tracking-wide text-blue-500">LOW</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.area} className="border-b border-slate-100 last:border-0">
              <td className="text-left px-2 py-3 text-[0.875rem] font-semibold text-slate-700 whitespace-nowrap">
                {row.area}
              </td>
              <td className="px-2 py-2">
                <div style={getCellStyle(row.High, 'high')}>{row.High}</div>
              </td>
              <td className="px-2 py-2">
                <div style={getCellStyle(row.Medium, 'medium')}>{row.Medium}</div>
              </td>
              <td className="px-2 py-2">
                <div style={getCellStyle(row.Low, 'low')}>{row.Low}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

