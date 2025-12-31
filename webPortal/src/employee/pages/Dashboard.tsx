import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../supervisor/context/AppContext';
import { Card, CardBody } from '../../supervisor/components/UI/Card';
import { Badge } from '../../supervisor/components/UI/Badge';
import { Button } from '../../supervisor/components/UI/Button';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
    const { state, getFilteredTasks } = useApp();
    const navigate = useNavigate();
    const { currentUser } = state;

    const tasks = getFilteredTasks();
    const openTasks = tasks.filter(t => t.status !== 'Completed');
    const overdueTasks = openTasks.filter(t => t.dueDate < new Date());
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const highPriorityTasks = openTasks.filter(t => t.priority === 'High');

    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const dueSoonTasks = openTasks.filter(t => t.dueDate >= now && t.dueDate <= next48Hours);

    // Simple greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{greeting}, {currentUser.name.split(' ')[0]}</h1>
                    <p className="text-gray-600 mt-2">
                        Here is an overview of your assigned tasks and safety alerts today.
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-500">Current Department</p>
                    <p className="text-lg font-bold text-primary-600">{currentUser.department || 'General Operations'}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                            <p className="text-2xl font-bold text-gray-900">{openTasks.length}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-full">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">High Priority</p>
                            <p className="text-2xl font-bold text-gray-900">{highPriorityTasks.length}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Priority Tasks List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Priority Tasks</h2>
                        <Button variant="outline" size="sm" onClick={() => navigate('/employee/tasks')}>View All</Button>
                    </div>

                    {openTasks.length === 0 ? (
                        <Card className="bg-gray-50 border-dashed">
                            <CardBody className="text-center py-8 text-gray-500">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                <p>You have no pending tasks. Great job!</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {openTasks
                                .sort((a, b) => {
                                    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
                                    const pA = priorityWeight[a.priority] || 0;
                                    const pB = priorityWeight[b.priority] || 0;
                                    if (pA !== pB) return pB - pA; // Higher priority first
                                    return a.dueDate.getTime() - b.dueDate.getTime();
                                })
                                .slice(0, 5)
                                .map(task => (
                                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/employee/tasks/${task.id}`)}>
                                        <CardBody className="p-4 flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                                task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                <ClipboardList size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{task.description}</h3>
                                                <p className="text-xs text-gray-500">Due: {format(task.dueDate, 'MMM d')} • {task.area}</p>
                                            </div>
                                            <Badge variant={task.status} className="text-[10px] px-1.5 py-0.5">{task.status}</Badge>
                                        </CardBody>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>

                {/* Due Soon Tasks List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Due Soon</h2>
                    </div>

                    {dueSoonTasks.length === 0 ? (
                        <Card className="bg-gray-50 border-dashed">
                            <CardBody className="text-center py-8 text-gray-500">
                                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                                <p>No tasks due in next 48h.</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {dueSoonTasks
                                .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                                .slice(0, 5)
                                .map(task => (
                                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-yellow-400" onClick={() => navigate(`/employee/tasks/${task.id}`)}>
                                        <CardBody className="p-4 flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                                                <Clock size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{task.description}</h3>
                                                <p className="text-xs text-red-500 font-medium">Due: {format(task.dueDate, 'MMM d, h:mm a')}</p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>

                {/* Recent Alerts / Quick Info */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Safety Alerts</h2>
                    <Card>
                        <CardBody className="p-0">
                            {state.alerts.slice(0, 3).map((alert, idx) => (
                                <div key={idx} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-3">
                                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${alert.severity === 'High' ? 'text-red-500' : 'text-orange-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2">{format(alert.timestamp, 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {state.alerts.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No active alerts.</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardBody>
                            <h3 className="font-bold text-lg mb-2">Safety Tip of the Day</h3>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                Always inspect your PPE before starting your shift. If you notice any damage, report it immediately to your supervisor.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};
