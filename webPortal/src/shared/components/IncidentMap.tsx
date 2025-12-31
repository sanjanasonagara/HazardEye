import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip as MapTooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Location } from '../types/Location';

// Fix for Leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export type LocationStats = {
    total: number;
    high?: number;
    medium?: number;
    low?: number;
};

interface IncidentMapProps {
    locations: Location[];
    getStats: (location: Location) => LocationStats;
    height?: string;
    center?: [number, number];
    zoom?: number;
    showPopup?: boolean;
    compactTooltip?: boolean; // For Supervisor style (smaller text, different format)
    className?: string;
    backgroundPolygon?: [number, number][]; // Optional background polygon (e.g. Refinery boundary)
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
    locations,
    getStats,
    height = '100%',
    center = [22.373, 73.112],
    zoom = 14,
    showPopup = true,
    compactTooltip = false,
    className,
    backgroundPolygon
}) => {
    return (
        <div style={{ height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }} className={className} >
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {locations.map((loc) => {
                    const stats = getStats(loc);
                    const hasIncidents = stats.total > 0;
                    const opacity = hasIncidents ? 1.0 : 0.4;
                    const fillColor = hasIncidents
                        ? (stats.high ? '#ef4444' : stats.medium ? '#f97316' : '#3b82f6')
                        : '#64748b'; // Slate 500 for inactive

                    // Parse polygon coordinates if available
                    // Check if it's a valid array of arrays [lat, lng]
                    let polygonPositions: [number, number][] | null = null;
                    if (loc.polygonCoordinates && Array.isArray(loc.polygonCoordinates) && loc.polygonCoordinates.length > 0) {
                        polygonPositions = loc.polygonCoordinates;
                    }

                    const tooltipContent = (
                        <div className="text-center">
                            <div className={compactTooltip ? "text-xs font-bold" : "text-sm font-bold"}>{loc.name}</div>
                            {hasIncidents ? (
                                <div className={compactTooltip ? "text-[10px]" : "text-xs"}>
                                    {compactTooltip ? `(${stats.total})` : `Reports: ${stats.total}`}
                                </div>
                            ) : (
                                <div className="text-[10px] text-gray-500 italic">No Reports</div>
                            )}
                        </div>
                    );

                    const popupContent = (
                        <div className="text-sm">
                            <strong className="block mb-1">{loc.name}</strong>
                            {hasIncidents ? (
                                <div className="flex gap-2">
                                    <span className="text-red-600 font-bold">H: {stats.high || 0}</span>
                                    <span className="text-orange-500 font-medium">M: {stats.medium || 0}</span>
                                    <span className="text-blue-500">L: {stats.low || 0}</span>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic">No active incidents reported.</div>
                            )}
                        </div>
                    );

                    return (
                        <React.Fragment key={loc.id}>
                            {polygonPositions && (
                                <Polygon
                                    positions={polygonPositions}
                                    pathOptions={{
                                        color: fillColor,
                                        fillOpacity: hasIncidents ? 0.2 : 0.05,
                                        weight: hasIncidents ? 2 : 1,
                                        opacity: opacity
                                    }}
                                >
                                    {showPopup && <Popup>{popupContent}</Popup>}
                                    <MapTooltip sticky direction="top" className="font-bold text-slate-700">
                                        {tooltipContent}
                                    </MapTooltip>
                                </Polygon>
                            )}

                            {/* Always show marker for center point interaction */}
                            <Marker position={[loc.latitude, loc.longitude]} opacity={opacity}>
                                <MapTooltip permanent direction="top" offset={[0, -20]} className="font-bold text-slate-700">
                                    {tooltipContent}
                                </MapTooltip>

                                {showPopup && (
                                    <Popup>
                                        {popupContent}
                                    </Popup>
                                )}
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* Supervisor "Plant Area Map" label overlay */}
            {
                compactTooltip && (
                    <div className="absolute left-3 top-3 bg-white/90 rounded-md px-3 py-2 shadow-sm border border-slate-200" style={{ zIndex: 400 }}>
                        <p className="text-[0.7rem] font-semibold tracking-wide text-slate-500 uppercase">
                            Plant Area Map
                        </p>
                        <p className="text-[0.7rem] text-slate-400">Incident density by Global Locations</p>
                    </div>
                )
            }
        </div >
    );
};
