import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    MapPin,
    Building2,
    MessageSquare,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { useApp } from '../../supervisor/context/AppContext';
import { Card, CardBody, CardHeader } from '../../supervisor/components/UI/Card';
import { Badge } from '../../supervisor/components/UI/Badge';
import { Button } from '../../supervisor/components/UI/Button';
import { Modal } from '../../supervisor/components/UI/Modal';
import { format } from 'date-fns';
import { formatRelativeTime } from '../../supervisor/utils/date';

export const TaskDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, updateTaskStatus, addTaskComment } = useApp();
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [delayReason, setDelayReason] = useState('');
    const [delayDate, setDelayDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [comment, setComment] = useState('');
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'resolution' | 'incident'>('overview');

    const task = state.tasks.find(t => t.id === id);
    const linkedIncident = task?.incidentId ? state.incidents.find(i => i.id === task.incidentId) : null;

    if (!task) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Task not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('..')}
                >
                    Back to Tasks
                </Button>
            </div>
        );
    }

    const isOverdue = task.dueDate < new Date() && task.status !== 'Completed';
    // Employee can always update their assigned tasks status in this portal context
    const canUpdateStatus = task.assignedTo === state.currentUser.id;

    const handleMarkDone = () => {
        if (!canUpdateStatus || task.status === 'Completed') return;
        updateTaskStatus(task.id, 'Completed');
    };

    const handleDelaySubmit = () => {
        if (!canUpdateStatus) return;
        if (!delayReason.trim()) return;
        const parsedDelayDate = new Date(delayDate);
        updateTaskStatus(task.id, 'Delayed', delayReason.trim(), parsedDelayDate);
        setShowDelayModal(false);
        setDelayReason('');
    };

    const handleAddComment = () => {
        if (!comment.trim()) return;
        addTaskComment(task.id, {
            taskId: task.id,
            userId: state.currentUser.id,
            userName: state.currentUser.name,
            userRole: state.currentUser.role,
            content: comment,
        });
        setComment('');
        setShowCommentModal(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate('..')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-gray-900 truncate">Task Details</h1>
                    <p className="text-gray-600 mt-1 text-sm truncate">Task ID: {task.id}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end text-right">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={task.status}>{task.status}</Badge>
                            <Badge variant={task.priority}>{task.priority}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                            Due:{' '}
                            <span className={isOverdue ? 'text-danger-600 font-medium' : ''}>
                                {format(task.dueDate, 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowCommentModal(true)}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                    </Button>

                    {canUpdateStatus && isOverdue && task.status !== 'Completed' && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setDelayReason('');
                                setDelayDate(format(new Date(), 'yyyy-MM-dd'));
                                setShowDelayModal(true);
                            }}
                        >
                            Delay
                        </Button>
                    )}
                    {canUpdateStatus && task.status !== 'Completed' && (
                        <Button onClick={handleMarkDone}>
                            Done
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs Layout */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        Task Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('resolution')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'resolution'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        Resolution Details
                    </button>
                    <button
                        onClick={() => setActiveTab('incident')}
                        className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'incident'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
                    >
                        Linked Incident ({linkedIncident ? '1' : '0'})
                    </button>
                </nav>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Task Description */}
                                <Card>
                                    <CardHeader>
                                        <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-gray-700 leading-relaxed">{task.description}</p>
                                    </CardBody>
                                </Card>

                                {/* Precautions */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-warning-600" />
                                            <h2 className="text-lg font-semibold text-gray-900">Precautions & Advisory</h2>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {task.precautions}
                                        </p>
                                    </CardBody>
                                </Card>

                                {/* Comments / Activity Feed */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <h2 className="text-lg font-semibold text-gray-900">Comments & Activity</h2>
                                        <Button variant="outline" size="sm" onClick={() => setShowCommentModal(true)}>
                                            <MessageSquare className="w-4 h-4 mr-2" /> Add Comment
                                        </Button>
                                    </CardHeader>
                                    <CardBody>
                                        {task.comments.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No comments yet</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {task.comments
                                                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                                                    .map(comment => (
                                                        <div
                                                            key={comment.id}
                                                            className="border-l-4 border-l-primary-500 pl-4 py-2"
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-gray-900">
                                                                        {comment.userName}
                                                                    </span>
                                                                    <Badge variant="default" className="text-xs">
                                                                        {comment.userRole}
                                                                    </Badge>
                                                                </div>
                                                                <span className="text-xs text-gray-500">
                                                                    {format(comment.timestamp, 'MMM d, yyyy h:mm a')}
                                                                    {(
                                                                        comment.userRole === 'supervisor') && (
                                                                            <> • {formatRelativeTime(comment.timestamp)}</>
                                                                        )}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm">{comment.content}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Delay History Sidebar */}
                            <div className="space-y-6">
                                {(() => {
                                    const history =
                                        task.delayHistory && task.delayHistory.length > 0
                                            ? [...task.delayHistory]
                                            : task.delayReason && task.delayDate
                                                ? [
                                                    {
                                                        reason: task.delayReason,
                                                        date: task.delayDate,
                                                    },
                                                ]
                                                : [];

                                    if (history.length === 0) return (
                                        <Card className="bg-gray-50/50 border-dashed">
                                            <CardBody className="py-8 text-center">
                                                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm font-medium text-gray-500">No Delays Recorded</p>
                                            </CardBody>
                                        </Card>
                                    );

                                    history.sort((a, b) => b.date.getTime() - a.date.getTime());

                                    return (
                                        <Card className="border-l-4 border-l-warning-500">
                                            <CardHeader className="pb-2">
                                                <h2 className="text-sm font-bold text-warning-900 uppercase tracking-wider">Delay History</h2>
                                            </CardHeader>
                                            <CardBody className="space-y-4">
                                                {history.map((entry, index) => (
                                                    <div key={index} className="space-y-1 pb-3 border-b border-warning-100 last:border-0 last:pb-0">
                                                        <p className="text-sm text-warning-800 font-medium">
                                                            {entry.reason}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-mono">
                                                            {format(entry.date, 'MMM d, yyyy h:mm a')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </CardBody>
                                        </Card>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resolution' && (
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900">Task Metadata & Resolution Info</h2>
                        </CardHeader>
                        <CardBody className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                {/* Section: Assignment */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assignment</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <User className="w-4 h-4 text-primary-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 truncate">{task.assignedToName}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Assigned To</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 truncate">{task.createdByName}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Created By</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{format(task.createdAt, 'MMM d, yyyy')}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Created On</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Location */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{task.area}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Area / Section</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{task.plant}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Plant / Facility</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Priority & Risk */}
                                <div className="p-6 space-y-4 bg-gray-50/30">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority & Risk</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Task Priority</p>
                                            <Badge variant={task.priority} className="px-3 py-1 font-bold text-xs">
                                                {task.priority}
                                            </Badge>
                                        </div>
                                        {isOverdue && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                <p className="text-xs font-bold text-red-700 uppercase tracking-tight">Overdue Task</p>
                                            </div>
                                        )}
                                        {!isOverdue && task.status === 'Completed' && (
                                            <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                                                <Badge variant="Completed" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight">Resolved</Badge>
                                                <p className="text-xs font-bold text-green-700 uppercase tracking-tight">Successfully</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {activeTab === 'incident' && (
                    <div>
                        {linkedIncident ? (
                            <Card className="hover:shadow-md transition-shadow">
                                <CardBody>
                                    <div className="flex items-start gap-4">
                                        <div className="w-24 h-24 flex-shrink-0">
                                            <img
                                                src={linkedIncident.imageUrl}
                                                alt="Incident"
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{linkedIncident.department} Issue</h3>
                                            <p className="text-gray-600 mb-2 line-clamp-2">{linkedIncident.description}</p>
                                            <div className="flex gap-2 mb-3">
                                                <Badge variant={linkedIncident.severity}>{linkedIncident.severity}</Badge>
                                                <Badge variant={linkedIncident.status}>{linkedIncident.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ) : (
                            <Card>
                                <CardBody className="text-center py-12 text-gray-500">
                                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p>This task is not linked to any specific incident.</p>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Delay Modal (employees only) */}
            {canUpdateStatus && (
                <Modal
                    isOpen={showDelayModal}
                    onClose={() => {
                        setShowDelayModal(false);
                        setDelayReason('');
                    }}
                    title="Delay Task"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delay Reason *
                            </label>
                            <textarea
                                value={delayReason}
                                onChange={(e) => setDelayReason(e.target.value)}
                                required
                                rows={3}
                                placeholder="Explain why this task is delayed..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delay Date *
                            </label>
                            <input
                                type="date"
                                value={delayDate}
                                onChange={(e) => setDelayDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDelayModal(false);
                                    setDelayReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelaySubmit}
                                disabled={!delayReason.trim()}
                            >
                                Save Delay
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Comment Modal */}
            <Modal
                isOpen={showCommentModal}
                onClose={() => {
                    setShowCommentModal(false);
                    setComment('');
                }}
                title="Add Comment"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment *
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={4}
                            placeholder="Enter your comment..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCommentModal(false);
                                setComment('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddComment}
                            disabled={!comment.trim()}
                        >
                            Add Comment
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
