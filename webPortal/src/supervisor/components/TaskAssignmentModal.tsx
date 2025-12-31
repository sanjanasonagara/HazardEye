import React, { useState } from 'react';
import { Incident, Priority } from '../types';
import { useApp } from '../context/AppContext';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { format } from 'date-fns';
import { useLocations } from '../../shared/context/LocationContext';

interface TaskAssignmentModalProps {
  incident: Incident;
  onClose: () => void;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  incident,
  onClose,
}) => {
  const { state, addTask } = useApp();
  const { locations } = useLocations();

  const [formData, setFormData] = useState({
    description: `Address ${incident.department} issue: ${incident.description}`,
    area: incident.area,
    plant: incident.plant,
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 'Medium' as Priority,
    precautions: incident.aiRecommendation?.preventiveSteps.join('; ') || 'Follow standard safety protocols.',
    assignedTo: state.users.find(u => u.role === 'employee')?.id || '',
  });

  const employeeUsers = state.users.filter(u => u.role === 'employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignedUser = state.users.find(u => u.id === formData.assignedTo);
    if (!assignedUser) return;

    addTask({
      incidentId: incident.id,
      description: formData.description,
      area: formData.area,
      plant: formData.plant,
      dueDate: new Date(formData.dueDate),
      priority: formData.priority,
      precautions: formData.precautions,
      assignedTo: formData.assignedTo,
      assignedToName: assignedUser.name,
      createdBy: state.currentUser.id,
      createdByName: state.currentUser.name,
      status: 'Open',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Task from Incident"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area *
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Area</option>
              {/* Fallback option if current incident area is not in active locations */}
              {!locations.some(l => l.name === formData.area && l.active) && formData.area && (
                <option value={formData.area}>{formData.area} (Historical)</option>
              )}
              {locations.filter(l => l.active).map(l => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plant *
            </label>
            <input
              type="text"
              value={formData.plant}
              onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To *
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select employee...</option>
            {employeeUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.department})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precautions / Advisory
          </label>
          <textarea
            value={formData.precautions}
            onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="AI-generated recommendations (editable)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
