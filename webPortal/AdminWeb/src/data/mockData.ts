
// -- Safety Resources (Added for Safety Guidelines Page) --
export const mockSafetyResources = [
    {
        id: 'sr-1',
        title: 'General Workplace Safety',
        type: 'Safety Guideline',
        lastUpdated: new Date('2024-12-15'),
        content: 'Standard safety protocols for all on-site personnel.',
        sections: [
            {
                title: 'Visitor & Employee Access',
                items: [
                    'Always wear your ID badge while on company premises.',
                    'Report any unauthorized personnel to security immediately.',
                    'Keep walkways and emergency exits clear of obstructions.'
                ],
                icon: 'ShieldCheck'
            },
            {
                title: 'Equipment Operation',
                items: [
                    'Do not operate machinery unless trained and authorized.',
                    'Always use the proper tools for the job.',
                    'Perform pre-operational checks on all equipment.'
                ],
                icon: 'Settings'
            }
        ]
    },
    {
        id: 'sr-2',
        title: 'Lockout/Tagout Procedure (LOTO)',
        type: 'SOP',
        lastUpdated: new Date('2024-11-20'),
        content: 'Standard Operating Procedure for controlling hazardous energy.',
        sections: [
            {
                title: 'Preparation for Shutdown',
                items: [
                    'Identify the energy source and type.',
                    'Notify all affected employees.',
                    'Prepare the necessary isolation devices.'
                ],
                icon: 'Power'
            },
            {
                title: 'Lock & Tag Application',
                items: [
                    'Apply the padlock or tagout device to the energy-isolating component.',
                    'Ensure the device is securely fastened.',
                    'Attach a warning tag with your name and date.'
                ],
                icon: 'Lock'
            }
        ]
    }
];

// -- Analytics Data (Reconstructed) --

export const ioclGujaratRefineryPolygon = [
    [22.38, 73.10],
    [22.38, 73.13],
    [22.36, 73.13],
    [22.36, 73.10]
];

export const analyticsData = {
    inactiveZones: [
        { id: 1, name: 'Zone A - Storage', lastReport: '8 days ago' },
        { id: 2, name: 'Zone C - Maintenance', lastReport: '12 days ago' },
        { id: 3, name: 'Zone B - Loading', lastReport: '15 days ago' }
    ],
    incidentTrend: [
        { date: 'Mon', incidents: 4 },
        { date: 'Tue', incidents: 7 },
        { date: 'Wed', incidents: 5 },
        { date: 'Thu', incidents: 8 },
        { date: 'Fri', incidents: 6 },
        { date: 'Sat', incidents: 3 },
        { date: 'Sun', incidents: 2 }
    ],
    heatmapData: [
        { area: 'Refinery Unit 1', high: 2, medium: 5, low: 3, lat: 22.375, lng: 73.115 },
        { area: 'Storage Tanks', high: 0, medium: 2, low: 8, lat: 22.370, lng: 73.120 },
        { area: 'Loading Bay', high: 1, medium: 1, low: 1, lat: 22.372, lng: 73.110 },
        { area: 'Admin Block', high: 0, medium: 0, low: 1, lat: 22.378, lng: 73.105 }
    ],
    incidentsPerArea: [
        { name: 'Refinery Unit 1', count: 10 },
        { name: 'Storage Tanks', count: 10 },
        { name: 'Loading Bay', count: 3 },
        { name: 'Admin Block', count: 1 }
    ]
};

// -- CMS Data (Reconstructed) --

export const contentTypes = ['All', 'Safety Guideline', 'SOP', 'Announcement', 'Policy'];

export const cmsContent = [
    {
        id: 1,
        title: 'Fire Safety Guidelines',
        type: 'Safety Guideline',
        status: 'Published',
        author: 'abc',
        date: '2025-12-15'
    },
    {
        id: 2,
        title: 'Chemical Handling SOP',
        type: 'SOP',
        status: 'Draft',
        author: 'xyz',
        date: '2025-12-10'
    },
    {
        id: 3,
        title: 'Holiday Schedule Announcement',
        type: 'Announcement',
        status: 'Archived',
        author: 'Admin',
        date: '2025-12-20'
    }
];
