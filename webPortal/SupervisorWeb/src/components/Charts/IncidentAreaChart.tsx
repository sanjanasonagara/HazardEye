import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Incident } from '../../types';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default Leaflet marker paths when bundled
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface IncidentAreaChartProps {
  incidents: Incident[];
}

export const IncidentAreaChart: React.FC<IncidentAreaChartProps> = ({ incidents }) => {
  // Group incidents by area + plant for the chart (preserve existing data logic)
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

  const areaMarkers = Object.entries(areaCounts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#0ea5e9', '#22c55e', '#6366f1'];

  // IOCL Gujarat Refinery polygon (reference plant boundary)
  const refineryPolygon: [number, number][] = [
    [22.3815, 73.0968], // NW
    [22.3852, 73.1134], // N
    [22.3776, 73.1252], // NE
    [22.3668, 73.1246], // E
    [22.3609, 73.1118], // SE
    [22.3634, 73.0975], // SW
  ];

  // Static marker positions within the plant boundary, reused for top incident areas
  const markerPositionsLatLng: [number, number][] = [
    [22.3785, 73.1075],
    [22.3735, 73.118],
    [22.3705, 73.1035],
    [22.3665, 73.115],
    [22.372, 73.1105],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* Static Leaflet map for spatial context */}
      <div className="h-72 rounded-lg border border-slate-200 overflow-hidden relative">
        {/* <MapContainer
          center={[22.3735, 73.111]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={false}
          zoomControl={false}
          keyboard={false}
          touchZoom={false}
          boxZoom={false}
        > */}
        <MapContainer
  center={[22.3735, 73.111]}
  zoom={14}
  style={{ height: '100%', width: '100%' }}
>

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <Polygon
            positions={refineryPolygon}
            pathOptions={{
              color: '#3b82f6',
              weight: 2,
              fillColor: '#bfdbfe',
              fillOpacity: 0.25,
            }}
          />

          {areaMarkers.map((marker, index) => {
            const position =
              markerPositionsLatLng[index % markerPositionsLatLng.length] ??
              markerPositionsLatLng[0];

            return (
              <Marker key={marker.area} position={position}>
                {/* Popup omitted to keep map lightweight; pins are purely contextual */}
              </Marker>
            );
          })}
        </MapContainer>

        <div className="absolute left-3 top-3 bg-white/90 rounded-md px-3 py-2 shadow-sm border border-slate-200">
          <p className="text-[0.7rem] font-semibold tracking-wide text-slate-500 uppercase">
            Plant Area Map
          </p>
          <p className="text-[0.7rem] text-slate-400">Static context for incident density</p>
        </div>
      </div>

      {/* Bar chart view */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 24, left: 8, bottom: 56 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={72}
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
              stroke="#94a3b8"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
              stroke="#94a3b8"
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.12)',
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3b82f6" barSize={42}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                offset={8}
                style={{ fill: '#1d4ed8', fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

