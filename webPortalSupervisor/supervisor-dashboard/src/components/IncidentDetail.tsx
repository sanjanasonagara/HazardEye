import React, { useState } from 'react';
import TaskForm from './TaskForm';
import { X, Check, MapPin, Calendar, Camera } from 'lucide-react';
import api from '../services/api';

interface Incident {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    location: string;
    capturedAt: string;
    mediaUris: string[];
    category?: string;
    advisory?: string;
    note?: string;
}

interface IncidentDetailProps {
    incident: Incident;
    onClose: () => void;
    onUpdate: () => void;
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident, onClose, onUpdate }) => {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async (status: string) => {
        setVerifying(true);
        try {
            await api.put(`/incidents/${incident.id}`, { Status: status });
            onUpdate();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-end z-50">
            <div className="relative w-full max-w-2xl bg-white shadow-xl min-h-screen p-6 animate-slide-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm font-semibold text-gray-500">#{incident.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                            ${incident.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {incident.severity}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">
                            {incident.status}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Incident Report</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            {new Date(incident.capturedAt).toLocaleString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            {incident.location || "Unknown Location"}
                        </div>
                    </div>

                    {incident.mediaUris && incident.mediaUris.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2 flex items-center"><Camera className="mr-2 h-4 w-4" /> Evidence</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Placeholders for images since we don't have real URLs signed yet, or need a separate fetch */}
                                {incident.mediaUris.map((uri, idx) => (
                                    <div key={idx} className="bg-gray-100 h-40 rounded flex items-center justify-center border text-gray-400">
                                        Image {idx + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6 space-y-4">
                        <div className="bg-orange-50 p-4 rounded border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-1">AI Advisory</h4>
                            <p className="text-sm text-gray-700">{incident.advisory || "No advisory available."}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-1">Description/Note</h4>
                            <p className="text-gray-700">{incident.note || incident.description || "No description provided."}</p>
                        </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                        <h3 className="font-bold text-lg">Actions</h3>

                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                            <div className="space-x-2">
                                <button
                                    onClick={() => handleVerify('Resolved')}
                                    disabled={verifying}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                                >
                                    Verify & Resolve
                                </button>
                                <button
                                    onClick={() => handleVerify('Rejected')}
                                    disabled={verifying}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                                >
                                    Reject
                                </button>
                            </div>

                            <button
                                onClick={() => setShowTaskForm(!showTaskForm)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                {showTaskForm ? 'Cancel Assignment' : 'Assign Task'}
                            </button>
                        </div>

                        {showTaskForm && (
                            <div className="bg-blue-50 p-4 rounded border border-blue-100">
                                <h4 className="font-semibold mb-2 text-blue-800">Assign Corrective Task</h4>
                                <TaskForm
                                    incidentId={incident.id}
                                    onSuccess={() => {
                                        setShowTaskForm(false);
                                        onUpdate();
                                        alert('Task Assigned Successfully');
                                    }}
                                    onCancel={() => setShowTaskForm(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetail;
