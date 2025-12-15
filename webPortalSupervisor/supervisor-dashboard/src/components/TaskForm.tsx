import React, { useState } from 'react';
import api from '../services/api';

interface TaskFormProps {
    incidentId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ incidentId, onSuccess, onCancel }) => {
    const [assignedTo, setAssignedTo] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tasks', {
                incidentId,
                assignedToUserId: parseInt(assignedTo), // Simplified: Assume ID input for now
                description,
                dueDate: dueDate ? new Date(dueDate) : null
            });
            onSuccess();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to assign task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Assign To (User ID)</label>
                <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    required
                />
                <p className="text-xs text-gray-500">Enter User ID (e.g., 2)</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Assigning...' : 'Assign Task'}
                </button>
            </div>
        </form>
    );
};

export default TaskForm;
