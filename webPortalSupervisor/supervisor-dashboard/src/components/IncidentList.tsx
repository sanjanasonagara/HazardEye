import React, { useState, useEffect } from 'react';
import api from '../services/api';
import IncidentDetail from './IncidentDetail';

interface Incident {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    location: string;
    capturedAt: string;
    mediaUris: string[];
}

const IncidentList: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    useEffect(() => {
        fetchIncidents();
    }, [filterStatus, filterSeverity]);

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('Status', filterStatus);
            if (filterSeverity) params.append('Severity', filterSeverity);

            const response = await api.get(`/incidents?${params.toString()}`);
            setIncidents(response.data.items || []);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Reported Incidents</h2>
                <div className="flex space-x-4">
                    <select
                        className="border rounded px-3 py-2 text-sm"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                    >
                        <option value="">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <select
                        className="border rounded px-3 py-2 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Severity</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {incidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">INC-{incident.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                                                incident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{incident.status}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(incident.capturedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedIncident(incident)}
                                            className="text-blue-600 hover:underline text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedIncident && (
                <IncidentDetail
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    onUpdate={() => {
                        fetchIncidents(); // Refresh list on update
                        setSelectedIncident(null); // Close modal
                    }}
                />
            )}
        </div>
    );
};

export default IncidentList;
