import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, TrendingUp, Clock, BarChart3, MapPin, Activity, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardBody, CardHeader } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { IncidentAreaChart } from '../components/Charts/IncidentAreaChart';
import { SeverityDistributionChart } from '../components/Charts/SeverityDistributionChart';
import { IncidentTrendChart } from '../components/Charts/IncidentTrendChart';
import { RepeatIncidentsChart } from '../components/Charts/RepeatIncidentsChart';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { getFilteredIncidents, getFilteredTasks, state } = useApp();
  const incidents = getFilteredIncidents();
  const tasks = getFilteredTasks();

  const stats = {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter(i => i.status === 'Open').length,
    highSeverity: incidents.filter(i => i.severity === 'High').length,
    pendingTasks: tasks.filter(t => t.status !== 'Completed').length,
  };

  const recentIncidents = incidents.slice(0, 5);
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of incidents and tasks</p>
      </div>

      {/* High-Visibility Alerts Section */}
      {state.alerts.length > 0 && (
        <div className="space-y-4">
          {state.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 shadow-sm animate-pulse-slow ${alert.severity === 'High'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-orange-50 border-orange-200 text-orange-900'
                }`}
            >
              <div className={`p-2 rounded-xl h-fit ${alert.severity === 'High' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                <AlertTriangle className={`w-6 h-6 ${alert.severity === 'High' ? 'text-red-600' : 'text-orange-600'
                  }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-lg">{alert.title}</h3>
                  <span className="text-xs font-medium opacity-70">
                    {format(alert.timestamp, 'h:mm a')}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xxl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-100">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Incidents</p>
                    <p className="text-3xl font-bold text-blue-950 mt-2">{stats.totalIncidents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border-amber-100">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Open Incidents</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{stats.openIncidents}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-50 border-red-100">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">High Severity</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">{stats.highSeverity}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 via-teal-100 to-sky-50 border-sky-100">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sky-900">Pending Tasks</p>
                    <p className="text-3xl font-bold text-sky-950 mt-2">{stats.pendingTasks}</p>
                  </div>
                  <div className="w-12 h-12 bg-sky-500/10 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-sky-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        
      </div>

      {/* Persistent Emergency Instructions - CRITICAL */}
        <Card className="bg-[#1e1b4b] border-indigo-900 text-white shadow-2xl overflow-hidden h-full flex flex-col">
  
  <CardHeader className="border-b border-indigo-800/50 bg-[#1e1b4b] px-6 py-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-600 rounded-lg animate-pulse">
        <Activity className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold tracking-wide">Emergency Hub</h3>
    </div>
  </CardHeader>

  <CardBody className="flex-1 px-6 py-6 space-y-8 bg-[#1e1b4b] text-white">
    {state.emergencyInstructions.map((instruction) => (
      <div key={instruction.id} className="space-y-4">
        <h4 className="font-bold text-red-400 uppercase tracking-widest text-xs">
          {instruction.title}
        </h4>

        <ul className="space-y-4">
          {instruction.steps.map((step, idx) => (
            <li
              key={idx}
              className="flex gap-4 text-sm leading-relaxed border-l-2 border-indigo-700 pl-5 py-1 hover:border-red-500 transition-colors"
            >
              <span className="text-indigo-400 font-bold min-w-[18px]">
                {idx + 1}.
              </span>
              <span className="text-indigo-100">
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </CardBody>

  <div className="px-6 pb-6 bg-[#1e1b4b]">
    <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-center gap-4">
      <div className="bg-red-600 p-2 rounded-full shadow-lg shadow-red-900/50">
        <Activity className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">
          Emergency Helpline
        </p>
        <p className="text-xl font-black text-white mt-1">
          9-1-1 / 555-0100
        </p>
      </div>
    </div>
  </div>

</Card>

      {/* Analytics Section */}
      {state.currentUser.role === 'supervisor' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
            <p className="text-gray-600 mt-1">Data-driven insights for safety management</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Reports per Area */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Incidents by Area</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Distribution of incidents across plant areas</p>
              </CardHeader>
              <CardBody>
                {incidents.length > 0 ? (
                  <IncidentAreaChart incidents={incidents} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-danger-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Severity Distribution</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Severity breakdown by area</p>
              </CardHeader>
              <CardBody>
                {incidents.length > 0 ? (
                  <SeverityDistributionChart incidents={incidents} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Incident Trend Over Time */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Incident Trend</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Incident frequency over time</p>
              </CardHeader>
              <CardBody>
                {incidents.length > 0 ? (
                  <IncidentTrendChart incidents={incidents} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Repeat Incidents */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-warning-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Repeat Incident Risk</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Areas with multiple incidents (high repeat risk)</p>
              </CardHeader>
              <CardBody>
                {incidents.length > 0 ? (
                  <RepeatIncidentsChart incidents={incidents} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Incidents & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
              <Link
                to="/incidents"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentIncidents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No incidents found</p>
              ) : (
                recentIncidents.map(incident => (
                  <Link
                    key={incident.id}
                    to={`/incidents/${incident.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={incident.imageUrl}
                        alt="Incident"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={incident.severity}>{incident.severity}</Badge>
                          <Badge variant={incident.status}>{incident.status}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {incident.department} - {incident.area}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(incident.dateTime, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <Link
                to="/tasks"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks found</p>
              ) : (
                recentTasks.map(task => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={task.priority}>{task.priority}</Badge>
                          <Badge variant={task.status}>{task.status}</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {format(task.dueDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

