import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  Maximize2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardBody } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';

import { TaskAssignmentModal } from '../components/TaskAssignmentModal';
import { generateIncidentReport } from '../utils/reportGenerator';
import { format } from 'date-fns';
import { incidentService } from '../../shared/services/incidentService';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, getFilteredTasks } = useApp();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');

  const incident = state.incidents.find(i => i.id === id);
  // Get tasks related to this incident
  const filteredTasks = getFilteredTasks(); // Get all visible tasks first
  const relatedTasks = filteredTasks.filter(t => t.incidentId === id);

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Incident not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('..')}
        >
          Back to Incidents
        </Button>
      </div>
    );
  }

  const handleDownloadReport = () => {
    generateIncidentReport(incident);
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Incident Details</h1>
          <p className="text-gray-600 mt-1">Incident ID: {incident.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {state.currentUser.role === 'supervisor' && (
            <>
                {incident.status !== 'Resolved' && incident.status !== 'Closed' && (
                     <Button 
                        variant="secondary"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={async () => {
                            if(confirm('Are you sure you want to close this incident?')) {
                                await incidentService.updateIncident(incident.id, { status: 'Resolved' });
                                // SignalR will update UI, or we can force refresh if needed
                            }
                        }}
                     >
                        Close Incident
                     </Button>
                )}
                <Button onClick={() => setShowTaskModal(true)}>
                  Create Task
                </Button>
            </>
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
            Overview
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Related Tasks ({relatedTasks.length})
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'overview' && (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardBody className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Unified Left: Image & Description */}
                <div className="lg:w-2/3 p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Visual supporting image */}
                    <div className="w-full sm:w-48 shrink-0">
                      <div className="relative group aspect-square">
                        <img
                          src={incident.imageUrl}
                          alt="Incident"
                          className="w-full h-full object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setShowImageModal(true)}
                        />
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Description integrated tightly */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                      <p className="text-sm text-gray-700 leading-relaxed text-pretty">
                        {incident.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unified Right: Metadata grid */}
                <div className="lg:w-1/3 bg-gray-50/50 p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Incident Metadata</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Status</p>
                      <Badge variant={incident.status} className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight">
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Severity</p>
                      <Badge variant={incident.severity} className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight">
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Department</p>
                      <p className="text-sm font-semibold text-gray-900">{incident.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Area / Plant</p>
                      <p className="text-sm text-gray-700">{incident.area}</p>
                      <p className="text-xs text-gray-500">{incident.plant}</p>
                    </div>
                    <div className="col-span-2 space-y-1 pt-2 border-t border-gray-200/50">
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Reported At</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {format(incident.dateTime, 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}



        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {relatedTasks.length === 0 ? (
              <Card>
                <CardBody className="text-center py-8 text-gray-500">
                  No tasks linked to this incident.
                </CardBody>
              </Card>
            ) : (
              relatedTasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{task.description}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={task.status}>{task.status}</Badge>
                          <Badge variant={task.priority}>{task.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Assigned to: {task.assignedToName}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/supervisor/tasks/${task.id}`)}>
                        View Task
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskAssignmentModal
          incident={incident}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Incident Image"
        size="xl"
      >
        <img
          src={incident.imageUrl}
          alt="Incident"
          className="w-full h-auto rounded-lg"
        />
      </Modal>
    </div>
  );
};

