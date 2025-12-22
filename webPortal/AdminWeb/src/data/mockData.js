// IOCL Gujarat Refinery Polygon
export const ioclGujaratRefineryPolygon = [
    [22.3815, 73.0968], // NW
    [22.3852, 73.1134], // N
    [22.3776, 73.1252], // NE
    [22.3668, 73.1246], // E
    [22.3609, 73.1118], // SE
    [22.3634, 73.0975], // SW
];

// Analytics & Dashboard Data
export const analyticsData = {
    incidentTrend: [
        { date: 'Mon', incidents: 4, severity: 'Low' },
        { date: 'Tue', incidents: 7, severity: 'Medium' },
        { date: 'Wed', incidents: 3, severity: 'Low' },
        { date: 'Thu', incidents: 8, severity: 'High' },
        { date: 'Fri', incidents: 5, severity: 'Medium' },
        { date: 'Sat', incidents: 2, severity: 'Low' },
        { date: 'Sun', incidents: 6, severity: 'Medium' },
    ],
    incidentsPerArea: [
        { name: 'Refinery A', count: 12 },
        { name: 'Fuller Site', count: 8 },
        { name: 'Warehouse B', count: 3 },
        { name: 'Chemical Plant', count: 5 },
        { name: 'Loading Dock', count: 2 },
    ],
    heatmapData: [
        { area: 'Refinery A', high: 4, medium: 6, low: 2, lat: 22.3750, lng: 73.1100 },
        { area: 'Fuller Site', high: 1, medium: 4, low: 3, lat: 22.3700, lng: 73.1150 },
        { area: 'Warehouse B', high: 0, medium: 1, low: 2, lat: 22.3800, lng: 73.1050 },
        { area: 'Chemical Plant', high: 2, medium: 2, low: 1, lat: 22.3650, lng: 73.1200 },
        { area: 'Loading Dock', high: 0, medium: 1, low: 1, lat: 22.3720, lng: 73.1020 },
    ],
    severityDistribution: [
        { name: 'Low', value: 45, color: '#3b82f6' }, // Blue-500
        { name: 'Medium', value: 30, color: '#f97316' }, // Orange-500
        { name: 'High', value: 15, color: '#ef4444' }, // Red-500
        { name: 'Critical', value: 10, color: '#991b1b' }, // Red-800
    ],
    inactiveZones: [
        { id: 'Z001', name: 'Zone B-North', lastReport: '5 days ago' },
        { id: 'Z045', name: 'East Wing Storage', lastReport: '12 days ago' },
        { id: 'Z012', name: 'Chemical Tank 4', lastReport: '8 days ago' },
    ],
    repeatIncidents: [
        { area: 'Loading Dock', incidentType: 'Slip/Trip', count: 5, trend: 'up' },
        { area: 'Refinery A', incidentType: 'Valve Leak', count: 3, trend: 'stable' },
    ]
};

// CMS Data
export const cmsContent = [
    { id: 1, title: 'Safety Protocol v2', type: 'Safety Guideline', status: 'Published', author: 'Admin', date: '2025-10-12' },
    { id: 2, title: 'Chemical Handling SOP', type: 'SOP', status: 'Draft', author: 'Safety Officer', date: '2025-10-10' },
    { id: 3, title: 'Storm Warning Alert', type: 'Alert', status: 'Archived', author: 'Admin', date: '2025-09-28' },
    { id: 4, title: 'Evacuation Route Map', type: 'Emergency Instructions', status: 'Published', author: 'Admin', date: '2025-08-15' },
    { id: 5, title: 'Q4 Safety Training', type: 'Training Material', status: 'Draft', author: 'HR', date: '2025-11-01' },
];

export const contentTypes = ['All', 'Safety Guideline', 'SOP', 'Alert', 'Emergency Instructions', 'Training Material'];
