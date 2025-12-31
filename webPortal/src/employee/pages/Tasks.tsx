import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, CheckCircle } from 'lucide-react';
import { useApp } from '../../supervisor/context/AppContext';

import { Card, CardBody } from '../../supervisor/components/UI/Card';
import { Badge } from '../../supervisor/components/UI/Badge';
import { Button } from '../../supervisor/components/UI/Button';
import { TaskStatus, Priority } from '../../supervisor/types';
import { format } from 'date-fns';

const statuses: TaskStatus[] = ['Open', 'In Progress', 'Completed', 'Delayed'];
const priorities: Priority[] = ['High', 'Medium', 'Low'];

export const Tasks: React.FC = () => {
    const { getFilteredTasks, updateTaskStatus } = useApp();
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
    const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Automatically filtered to Employee's tasks by AppContext
    let tasks = getFilteredTasks();

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

    const handleMarkDone = (taskId: string) => {
        updateTaskStatus(taskId, 'Completed');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage your assigned responsibilities
                    </p>
                </div>
            </div>

            {/* Search + Filters row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full h-11 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                </div>

                <div className="w-full md:flex-1">
                    <Card className="h-full">
                        <CardBody className="py-2">
                            <div className="flex flex-col gap-4">
                                {/* Status Filters */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[100px]">
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

                                {/* Priority Filters */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[100px]">
                                        <div className="w-4" /> {/* Spacer to align with icon above */}
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
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }
                                                `}
                                            >
                                                {priority}
                                            </button>
                                        ))}
                                    </div>
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
                            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">No tasks found</p>
                            <p className="text-gray-500 text-sm mt-1">
                                You are all caught up!
                            </p>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="space-y-4">
                    {tasks.map(task => {
                        const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';

                        return (
                            <Card
                                key={task.id}
                                onClick={() => navigate(`${task.id}`)}
                                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary-500"
                            >
                                <CardBody>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={task.priority}>{task.priority}</Badge>
                                                <Badge variant={task.status}>{task.status}</Badge>
                                                {overdue && (
                                                    <Badge variant="High" className="bg-red-100 text-red-800">
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                                {task.description}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Due: {format(task.dueDate, 'MMM d, yyyy')}</span>
                                                </div>
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
                                                Mark as Done
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-green-600 font-bold ml-auto flex items-center gap-1">
                                                <CheckCircle size={14} /> Completed
                                            </span>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
