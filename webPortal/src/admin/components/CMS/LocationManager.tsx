import React, { useState } from 'react';
import { useLocations } from '../../../shared/context/LocationContext';
import { Location } from '../../../shared/types/Location';
import {
    Plus,
    Search,
    MapPin,
    Edit3,
    Trash2,
    X,
    Grid
} from 'lucide-react';
import { Button } from '../UI/Button';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Fix for Leaflet default marker icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map click handler component
const LocationMarkerSelector = ({ onSelect, position, quadrantMode, centerLat, centerLng }: {
    onSelect: (lat: number, lng: number, quadrant?: 'NE' | 'NW' | 'SE' | 'SW') => void,
    position: [number, number],
    quadrantMode: boolean,
    centerLat: number,
    centerLng: number
}) => {
    useMapEvents({
        click(e) {
            let quadrant: 'NE' | 'NW' | 'SE' | 'SW' | undefined = undefined;
            if (quadrantMode) {
                if (e.latlng.lat >= centerLat && e.latlng.lng >= centerLng) quadrant = 'NE';
                else if (e.latlng.lat >= centerLat && e.latlng.lng < centerLng) quadrant = 'NW';
                else if (e.latlng.lat < centerLat && e.latlng.lng >= centerLng) quadrant = 'SE';
                else quadrant = 'SW';
            }
            onSelect(e.latlng.lat, e.latlng.lng, quadrant);
        },
    });

    return position ? (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    ) : null;
};

export const LocationManager = () => {
    const { locations, addLocation, updateLocation, deleteLocation, isLoading } = useLocations();
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [quadrantMode, setQuadrantMode] = useState(false);

    // Center of the refinery for quadrant logic (approximate)
    const REFINERY_CENTER_LAT = 22.3735;
    const REFINERY_CENTER_LNG = 73.111;

    const [formData, setFormData] = useState<Omit<Location, 'id'>>({
        name: '',
        latitude: REFINERY_CENTER_LAT,
        longitude: REFINERY_CENTER_LNG,
        active: true,
        quadrant: undefined,
        type: 'Plant',
        parentLocationId: undefined
    });

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenCreate = () => {
        setFormData({
            name: '',
            latitude: REFINERY_CENTER_LAT,
            longitude: REFINERY_CENTER_LNG,
            active: true,
            quadrant: undefined,
            type: 'Plant',
            parentLocationId: undefined
        });
        setEditingLocation(null);
        setIsCreating(true);
        setQuadrantMode(false);
    };

    const handleEdit = (loc: Location) => {
        setFormData({
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            active: loc.active,
            quadrant: loc.quadrant,
            type: loc.type || 'Plant',
            parentLocationId: loc.parentLocationId
        });
        setEditingLocation(loc);
        setIsCreating(true);
        setQuadrantMode(!!loc.quadrant);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLocation) {
                await updateLocation(editingLocation.id, formData);
            } else {
                await addLocation(formData);
            }
            setIsCreating(false);
            setEditingLocation(null);
        } catch (err) {
            alert('Failed to save location.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            await deleteLocation(id);
        }
    };

    // --- Styles ---
    const styles = {
        overlay: {
            position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        },
        modal: {
            backgroundColor: 'white', borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '900px', // Wider for Map
            margin: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' as const, maxHeight: '90vh'
        },
        modalHeader: {
            padding: '1.5rem', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
        },
        modalTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 },
        modalBody: { padding: '1.5rem', overflowY: 'auto' as const, display: 'flex', gap: '24px', flexDirection: 'column' as const }, // Changed to column for responsive
        formGroup: { marginBottom: '1.25rem' },
        label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.375rem' },
        input: {
            width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
            border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#1e293b', outline: 'none'
        },
        modalFooter: {
            padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
        },
        actionBtn: {
            padding: '0.5rem', color: '#64748b', backgroundColor: 'transparent', border: 'none',
            cursor: 'pointer', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
        },
        mapContainer: {
            height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative' as const
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search locations..."
                        style={{ ...styles.input, paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="primary" onClick={handleOpenCreate}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Add Location
                </Button>
            </div>

            {/* Table */}
            <div style={{
                backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>DB_ID</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Location Name</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Coordinates (LAT, LNG)</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Quadrant</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Management</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading Database...</td></tr>
                        ) : filteredLocations.length > 0 ? (
                            filteredLocations.map(loc => (
                                <tr key={loc.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{loc.id}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', color: '#3b82f6' }}>
                                                <MapPin size={16} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{loc.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                        {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                        {loc.quadrant || <span style={{ color: '#cbd5e1' }}>N/A</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                            backgroundColor: loc.active ? '#dcfce7' : '#fee2e2',
                                            color: loc.active ? '#15803d' : '#991b1b',
                                            display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content', border: `1px solid ${loc.active ? '#bbf7d0' : '#fecaca'}`
                                        }}>
                                            {loc.active ? 'LIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                            <button onClick={() => handleEdit(loc)} style={styles.actionBtn} title="Edit Record">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(loc.id)} style={{ ...styles.actionBtn, color: '#ef4444' }} title="Delete Record">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No records found in database.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isCreating && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>{editingLocation ? 'Edit Location' : 'Add New Location'}</h2>
                            <button onClick={() => setIsCreating(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={styles.modalBody}>
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1', minWidth: '300px' }}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Name</label>
                                            <input
                                                required
                                                type="text"
                                                style={styles.input}
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Type</label>
                                            <select
                                                style={styles.input}
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                            >
                                                <option value="Plant">Plant</option>
                                                <option value="Unit">Unit</option>
                                                <option value="Area">Area</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Parent Location</label>
                                            <select
                                                style={styles.input}
                                                value={formData.parentLocationId || ''}
                                                onChange={e => setFormData({ ...formData, parentLocationId: e.target.value || undefined })}
                                            >
                                                <option value="">None (Top Level)</option>
                                                {locations
                                                   .filter(l => !editingLocation || l.id !== editingLocation.id) // Prevent circular ref
                                                   .map(l => (
                                                    <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <label style={{ ...styles.label, marginBottom: 0 }}>Coordinates</label>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                                                    Click map to select
                                                </div>
                                            </div>
                                            <div style={{ ...styles.input, backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}>
                                                {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Quadrant Mode (Admin Only)</label>
                                            <button
                                                type="button"
                                                onClick={() => setQuadrantMode(!quadrantMode)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                                    backgroundColor: quadrantMode ? '#3b82f6' : '#f1f5f9',
                                                    color: quadrantMode ? 'white' : '#64748b',
                                                    border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Grid size={16} />
                                                {quadrantMode ? 'Quadrant Mode ON' : 'Quadrant Mode OFF'}
                                            </button>
                                            {formData.quadrant && quadrantMode && (
                                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#3b82f6', fontWeight: 600 }}>
                                                    Assigned Quadrant: {formData.quadrant}
                                                </div>
                                            )}
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.active}
                                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                                />
                                                Active Location
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ flex: '1.5', minWidth: '300px' }}>
                                        <div style={styles.mapContainer}>
                                            <MapContainer
                                                center={[REFINERY_CENTER_LAT, REFINERY_CENTER_LNG]}
                                                zoom={14}
                                                style={{ height: '100%', width: '100%' }}
                                                className="location-picker-map"
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                />

                                                <LocationMarkerSelector
                                                    onSelect={(lat, lng, quad) => setFormData({ ...formData, latitude: lat, longitude: lng, quadrant: quad })}
                                                    position={[formData.latitude, formData.longitude]}
                                                    quadrantMode={quadrantMode}
                                                    centerLat={REFINERY_CENTER_LAT}
                                                    centerLng={REFINERY_CENTER_LNG}
                                                />

                                                {/* Show other active locations as context (small gray markers) */}
                                                {locations.filter(l => l.active && (!editingLocation || l.id !== editingLocation.id)).map(loc => (
                                                    <Marker
                                                        key={loc.id}
                                                        position={[loc.latitude, loc.longitude]}
                                                        opacity={0.5}
                                                    >
                                                    </Marker>
                                                ))}

                                            </MapContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">{editingLocation ? 'Save Changes' : 'Create Location'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
