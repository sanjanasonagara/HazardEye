import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Filter, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocations } from '../../shared/context/LocationContext';
import { Card, CardBody } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { TaskStatus, Priority } from '../types';
import { format } from 'date-fns';

const statuses: TaskStatus[] = ['Open', 'In Progress', 'Completed', 'Delayed'];
const priorities: Priority[] = ['High', 'Medium', 'Low'];

export const Tasks: React.FC = () => {
  const { getFilteredTasks, state, updateTaskStatus } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  let tasks = getFilteredTasks();

  // Apply search filter (case-insensitive) across key fields
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    tasks = tasks.filter(task => {
      const haystacks = [
        task.description,
        task.area,
        task.plant,
        task.assignedToName,
      ];
      return haystacks.some(
        value =>
          value && value.toLowerCase().includes(q)
      );
    });
  }

  // Apply filters
  if (statusFilter.length > 0) {
    tasks = tasks.filter(t => statusFilter.includes(t.status));
  }
  if (priorityFilter.length > 0) {
    tasks = tasks.filter(t => priorityFilter.includes(t.priority));
  }

  const toggleFilter = <T extends TaskStatus | Priority>(
    currentFilters: T[],
    setFilters: (filters: T[]) => void,
    value: T
  ) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter(f => f !== value));
    } else {
      setFilters([...currentFilters, value]);
    }
  };

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date();
  };

  const isEmployee = state.currentUser.role === 'employee';

  // Employee-specific actions (comment/delay) are handled on Task Detail view only

  const handleMarkDone = (taskId: string) => {
    updateTaskStatus(taskId, 'Completed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            {state.currentUser.role === 'supervisor'
              ? 'Manage and track all tasks'
              : 'View your assigned tasks'}
          </p>
        </div>
        {state.currentUser.role === 'supervisor' && (
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Task
          </Button>
        )}
      </div>

      {/* Search + Filters row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks by description, area, plant, or assignee..."
            className="w-full h-11 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        <div className="w-full md:flex-1">
          <Card className="h-full">
            <CardBody className="py-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleFilter(statusFilter, setStatusFilter, status)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${statusFilter.includes(status)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {priorities.map(priority => (
                    <button
                      key={priority}
                      onClick={() => toggleFilter(priorityFilter, setPriorityFilter, priority)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${priorityFilter.includes(priority)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No tasks found</p>
              <p className="text-gray-500 text-sm mt-1">
                {statusFilter.length > 0 || priorityFilter.length > 0
                  ? 'Try adjusting your filters'
                  : 'No tasks have been assigned yet'}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => {
            const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';

            if (!isEmployee) {
              // Supervisor view remains the original layout
              return (
                <Card
                  key={task.id}
                  onClick={() => navigate(`${task.id}`)}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={task.priority}>{task.priority}</Badge>
                          <Badge variant={task.status}>{task.status}</Badge>
                          {overdue && (
                            <Badge variant="High" className="bg-danger-100 text-danger-800">
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2">
                          {task.description}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className={overdue ? 'text-danger-600 font-medium' : ''}>
                              Due: {format(task.dueDate, 'MMM d, yyyy')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{`Assigned to: ${task.assignedToName}`}</span>
                          </div>

                          <span className="text-gray-500">
                            {task.area} • {task.plant}
                          </span>
                        </div>

                        {task.delayReason && (
                          <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                            <p className="text-sm font-medium text-warning-900 mb-1">
                              Delay Reason:
                            </p>
                            <p className="text-sm text-warning-800">{task.delayReason}</p>
                          </div>
                        )}

                        {task.comments.length > 0 && (
                          <div className="mt-3 text-sm text-gray-500">
                            {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            }

            // Employee task card – read-only except Done
            return (
              <Card
                key={task.id}
                onClick={() => navigate(`${task.id}`)}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardBody>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={task.priority}>{task.priority}</Badge>
                        <Badge variant={task.status}>{task.status}</Badge>
                        {overdue && (
                          <Badge variant="High" className="bg-danger-100 text-danger-800">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {task.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span>Assigned by: {task.createdByName}</span>
                        <span>
                          Due: {format(task.dueDate, 'MMM d, yyyy')}
                          {overdue && ' • overdue'}
                        </span>
                        <span className="text-gray-500">
                          {task.area} • {task.plant}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {task.status !== 'Completed' ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleMarkDone(task.id);
                        }}
                      >
                        Done
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500 ml-auto">
                        Marked as completed
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Create Task Modal (supervisor only) */}
      {state.currentUser.role === 'supervisor' && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Employee delay/comment interactions are handled on Task Detail view */}
    </div>
  );
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { state, addTask } = useApp();
  const { locations } = useLocations();
  
  // Requirement: Show all users except the current user
  const assignableUsers = state.users.filter(u => u.id !== state.currentUser.id);
  
  const defaultAssignee = assignableUsers[0];

  const [formData, setFormData] = useState({
    description: '',
    area: '',
    plant: '',
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 'Medium' as Priority,
    precautions: '',
    assignedTo: defaultAssignee ? defaultAssignee.id : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignedUser = state.users.find(u => u.id === formData.assignedTo);
    if (!assignedUser) return;

    addTask({
      incidentId: undefined,
      description: formData.description,
      area: formData.area,
      plant: formData.plant,
      dueDate: new Date(formData.dueDate),
      priority: formData.priority,
      precautions: formData.precautions || 'Follow standard safety protocols.',
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
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
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
              onChange={(e) =>
                setFormData(prev => ({ ...prev, area: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select area...</option>
              {locations.filter(l => l.active).map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plant *
            </label>
            <select
              value={formData.plant}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, plant: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select plant...</option>
              {locations
                .filter(l => l.active && l.type === 'Plant')
                .map(plant => (
                  <option key={plant.id} value={plant.name}>
                    {plant.name}
                  </option>
                ))}
            </select>
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
              onChange={(e) =>
                setFormData(prev => ({ ...prev, dueDate: e.target.value }))
              }
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
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
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
            onChange={(e) =>
              setFormData(prev => ({ ...prev, assignedTo: e.target.value }))
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select user...</option>
            {assignableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role} - {user.department})
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
            onChange={(e) =>
              setFormData(prev => ({ ...prev, precautions: e.target.value }))
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="AI-generated recommendations (optional, editable)"
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


