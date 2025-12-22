import React, { useState } from 'react';
import {
    Plus,
    Search,
    Calendar,
    User,
    MapPin,
    ArrowLeft,
    Edit,
    MessageSquare,
    Trash2,
    AlertCircle,
    Filter
} from 'lucide-react';

const Maintenance = () => {
    const [view, setView] = useState('list'); // 'list' | 'details'
    const [selectedTask, setSelectedTask] = useState(null);

    // Mock Data mimicking the screenshot
    const [tasks] = useState([
        {
            id: 'task-1',
            description: 'Address Fire & Safety issue: Chemical spill detected in storage area. Containment and cleanup required.',
            priority: 'High',
            status: 'Completed',
            dueDate: 'Dec 31, 2025',
            assignedTo: 'Sarah Employee',
            createdBy: 'John Supervisor',
            createdOn: 'Dec 18, 2025',
            plant: 'Plant A',
            area: 'South Wing',
            precautions: 'Conduct monthly visual inspections of all electrical panels; Install protective covers on all exposed wiring; Implement lockout/tagout procedures for maintenance; Schedule quarterly electrical safety audits',
            comments: []
        },
        {
            id: 'task-2',
            description: 'Address Electrical issue: Inadequate ventilation in confined space. Air quality concern.',
            priority: 'Low',
            status: 'In Progress',
            dueDate: 'Dec 17, 2025',
            assignedTo: 'Mike Technician',
            createdBy: 'John Supervisor',
            createdOn: 'Dec 15, 2025',
            plant: 'Warehouse',
            area: 'North Wing',
            precautions: 'Ensure proper ventilation fans are active. Use gas monitors before entry.',
            comments: []
        },
        {
            id: 'task-3',
            description: 'Address General issue: Fire extinguisher missing from designated location. Safety compliance issue.',
            priority: 'High',
            status: 'In Progress',
            dueDate: 'Dec 20, 2025',
            assignedTo: 'Mike Technician',
            createdBy: 'Safety Officer',
            createdOn: 'Dec 19, 2025',
            plant: 'Warehouse',
            area: 'Main Facility',
            precautions: 'Check all fire usage logs. Replace immediately from spare inventory.',
            comments: [1]
        },
        {
            id: 'task-4',
            description: 'Address Environmental issue: Structural crack observed in support beam. Engineering assessment needed.',
            priority: 'High',
            status: 'Completed',
            dueDate: 'Dec 23, 2025',
            assignedTo: 'Emma Engineer',
            createdBy: 'Site Manager',
            createdOn: 'Dec 10, 2025',
            plant: 'Office Building',
            area: 'Main Facility',
            precautions: 'Cordon off area below the beam. Do not apply heavy load until assessed.',
            comments: []
        }
    ]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setView('details');
    };

    const handleBack = () => {
        setSelectedTask(null);
        setView('list');
    };

    return (
        <div className="space-y-6">
            {view === 'list' ? (
                <div className="animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
                            <p className="text-slate-500">Manage and track all tasks</p>
                        </div>
                        <button className="btn btn-primary flex items-center gap-2">
                            <Plus size={18} />
                            Create New Task
                        </button>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search tasks by description, area, plant, or assignee..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 text-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-4 items-center flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm flex items-center gap-1"><Filter size={14} /> Status:</span>
                                {['Open', 'In Progress', 'Completed', 'Delayed'].map(status => (
                                    <button key={status} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 transition-colors">
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm flex items-center gap-1"><Filter size={14} /> Priority:</span>
                                {['High', 'Medium', 'Low'].map(priority => (
                                    <button key={priority} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 transition-colors">
                                        {priority}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3"
                            >
                                <div className="flex gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'High' ? 'bg-red-100 text-red-600' :
                                            task.priority === 'Low' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {task.priority}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                            task.status === 'Overdue' ? 'bg-red-100 text-red-600' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {task.status}
                                    </span>
                                    {task.status === 'Overdue' && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Overdue</span>}
                                </div>

                                <h3 className="text-base font-semibold text-slate-800">{task.description}</h3>

                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>Due: <span className="text-slate-700 font-medium">{task.dueDate}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} />
                                        <span>Assigned to: <span className="text-slate-700 font-medium">{task.assignedTo}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-400">•</span>
                                        <span>{task.plant} • {task.area}</span>
                                    </div>
                                </div>
                                {task.comments.length > 0 && (
                                    <div className="text-xs text-slate-400 mt-1">{task.comments.length} comment</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    {/* Details View Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div className="flex items-start gap-4">
                            <button onClick={handleBack} className="mt-1 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Task Details</h2>
                                <p className="text-slate-500 text-sm">Task ID: {selectedTask.id}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${selectedTask.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {selectedTask.status}
                            </span>
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${selectedTask.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {selectedTask.priority}
                            </span>
                            <span className="text-xs text-slate-500 mr-2">Due: {selectedTask.dueDate}</span>

                            <button className="btn btn-outline flex items-center gap-2 text-sm py-1.5">
                                <Edit size={16} /> Edit Task
                            </button>
                            <button className="btn btn-outline flex items-center gap-2 text-sm py-1.5">
                                <MessageSquare size={16} /> Add Comment
                            </button>
                            <button className="btn btn-outline flex items-center gap-2 text-sm py-1.5 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                <Trash2 size={16} /> Delete Task
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column (Main Content) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description Box */}
                            <div className="card">
                                <h3 className="font-bold text-slate-800 mb-4">Description</h3>
                                <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 text-slate-700 text-sm leading-relaxed">
                                    {selectedTask.description}
                                </div>
                            </div>

                            {/* Precautions Box */}
                            <div className="card">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-orange-500" />
                                    Precautions & Advisory
                                </h3>
                                <div className="p-4 border border-slate-100 rounded-lg bg-white text-slate-600 text-sm leading-relaxed">
                                    {selectedTask.precautions}
                                </div>
                            </div>

                            {/* Comments Box */}
                            <div className="card min-h-[200px]">
                                <h3 className="font-bold text-slate-800 mb-4">Comments & Activity</h3>
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm py-8">
                                    <MessageSquare size={32} className="mb-2 opacity-20" />
                                    No comments yet
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Sidebar) */}
                        <div className="space-y-6">
                            {/* Priority & Risk */}
                            <div className="card">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Priority & Risk</h3>
                                <div className="space-y-1">
                                    <span className="text-xs text-slate-500 block">Priority</span>
                                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase ${selectedTask.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {selectedTask.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Assignment */}
                            <div className="card">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Assignment</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-slate-400"><User size={18} /></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{selectedTask.assignedTo}</p>
                                            <p className="text-xs text-slate-400">Assigned To</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-slate-400"><User size={18} /></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{selectedTask.createdBy}</p>
                                            <p className="text-xs text-slate-400">Created By</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-slate-400"><Clock size={16} /></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{selectedTask.createdOn}</p>
                                            <p className="text-xs text-slate-400">Created On</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="card">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Location</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-slate-400"><MapPin size={18} /></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{selectedTask.area}</p>
                                            <p className="text-xs text-slate-400">Area</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 text-slate-400"><MapPin size={18} /></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{selectedTask.plant}</p>
                                            <p className="text-xs text-slate-400">Plant</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
