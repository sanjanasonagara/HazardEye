import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AppState,
  User,
  Incident,
  Task,
  FilterState,
  UserRole,
  TaskStatus,
  TaskComment,
  TaskDelayEntry,
} from '../types';

import { incidentService } from '../../shared/services/incidentService';
import { taskService } from '../../shared/services/taskService';
import { fetchApi } from '../../shared/services/api';
import { signalRService } from '../../shared/services/signalrService';
import { useEffect } from 'react';

interface AppContextType {
  state: AppState;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, delayReason?: string, delayDate?: Date) => void;
  deleteTask: (taskId: string) => void;
  addTaskComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'timestamp'>) => void;
  updateTaskDetails: (
    taskId: string,
    updates: Pick<Task, 'description' | 'area' | 'plant' | 'dueDate' | 'priority' | 'precautions'>
  ) => void;
  getFilteredIncidents: () => Incident[];
  getFilteredTasks: () => Task[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const initialFilters: FilterState = {
  timeRange: 'All',
  areas: [],
  severities: [],
  departments: [],
  statuses: [],
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]); // mockUsers removed
  const [tasks, setTasks] = useState<Task[]>([]); // Initial empty tasks until incidents load

  // Initialize from localStorage if available
  // Initialize from localStorage if available
  // Initialize from localStorage if available
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    try {
      const storedJson = localStorage.getItem('user');
      console.log('AppContext: Reading user from localStorage:', storedJson);
      if (storedJson) {
        const parsed = JSON.parse(storedJson);
        const user = {
          id: String(parsed.id),
          name: parsed.firstName && parsed.lastName ? `${parsed.firstName} ${parsed.lastName}` : parsed.name || 'Unknown',
          email: parsed.email,
          role: ((parsed.role?.toLowerCase() === 'safetyofficer' || parsed.role?.toLowerCase() === 'supervisor') ? 'supervisor' : 'employee') as UserRole,
          department: (parsed.company || parsed.department || 'General') as any, // Cast to any to bypass strict enum for now
          avatar: `https://i.pravatar.cc/150?u=${parsed.id}`
        };
        console.log('AppContext: Initialized user state:', user);
        return user as User;
      }
    } catch (e) {
      console.error("AppContext: Failed to parse user from local storage", e);
    }
    console.warn('AppContext: No valid user found in localStorage, defaulting to employee');
    return {
      id: '',
      name: '',
      email: '',
      role: 'employee',
      department: 'General',
      avatar: ''
    } as User;
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);

    useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data independently so one failure doesn't block others
        const incidentsPromise = incidentService.getIncidents().catch(err => {
            console.error("Failed to load incidents", err);
            return [];
        });
        const tasksPromise = taskService.getTasks().catch(err => {
            console.error("Failed to load tasks", err);
            return [];
        });
        const usersPromise = fetchApi<User[]>('/users').catch(err => {
             console.error("Failed to load users", err);
             return [];
        });

        const [incidentsData, tasksData, usersData] = await Promise.all([
          incidentsPromise,
          tasksPromise,
          usersPromise
        ]);

        setIncidents(incidentsData);
        setTasks(tasksData);
        // Ensure usersData is an array before setting
        const mappedUsers: User[] = Array.isArray(usersData) ? usersData.map((u: any) => ({
          id: u.id.toString(),
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: u.role.toLowerCase() as UserRole,
          department: u.company || 'General',
          avatar: `https://i.pravatar.cc/150?u=${u.id}`,
          employeeId: u.employeeId,
        })) : [];

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to load data from API", error);
        // Fallback to empty
        setIncidents([]);
        setTasks([]);
        setUsers([]); 
      }
    };
    fetchData();

    // Start SignalR
    const token = localStorage.getItem('token');
    if (token) {
        signalRService.startConnection(token);

        const handleIncidentCreated = (newIncident: any) => {
            console.log('SignalR: IncidentCreated', newIncident);
            const mappedIncident = {
                ...newIncident,
                id: newIncident.id.toString(),
                dateTime: new Date(newIncident.capturedAt || newIncident.capturedAt),
                imageUrl: newIncident.mediaUris && newIncident.mediaUris.length > 0 ? newIncident.mediaUris[0] : 'https://via.placeholder.com/150',
                status: newIncident.status || 'Open',
                severity: newIncident.severity || 'Low'
            };
            setIncidents(prev => {
                if (prev.some(i => i.id === mappedIncident.id)) return prev;
                return [mappedIncident, ...prev];
            });
        };

        const handleIncidentUpdated = (updatedIncident: any) => {
            console.log('SignalR: IncidentUpdated', updatedIncident);
            const mappedIncident = {
                ...updatedIncident,
                id: updatedIncident.id.toString(),
                dateTime: new Date(updatedIncident.capturedAt),
                imageUrl: updatedIncident.mediaUris && updatedIncident.mediaUris.length > 0 ? updatedIncident.mediaUris[0] : 'https://via.placeholder.com/150',
            };
            setIncidents(prev => prev.map(i => i.id === mappedIncident.id ? mappedIncident : i));
        };

        const handleTaskCreated = (newTask: any) => {
             console.log('SignalR: TaskCreated', newTask);
             const mappedTask = {
                 ...newTask,
                 id: newTask.id.toString(),
                 incidentId: newTask.incidentId?.toString(),
                 dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
                 createdAt: newTask.createdAt ? new Date(newTask.createdAt) : new Date(),
                 delayHistory: (newTask.delayHistory || []).map((h: any) => ({
                    ...h,
                    date: new Date(h.date)
                 })),
                 comments: (typeof newTask.comments === 'string' ? JSON.parse(newTask.comments) : (newTask.comments || [])).map((c: any) => ({
                     ...c,
                     timestamp: new Date(c.timestamp)
                 }))
             };
             setTasks(prev => {
                 if (prev.some(t => t.id === mappedTask.id)) return prev;
                 return [mappedTask, ...prev];
             });
        };

        const handleTaskUpdated = (updatedTask: any) => {
             console.log('SignalR: TaskUpdated', updatedTask);
             const task = {
                 ...updatedTask,
                 id: updatedTask.id.toString(),
                 delayHistory: (updatedTask.delayHistory || []).map((h: any) => ({
                    ...h,
                    date: new Date(h.date)
                 })),
                 comments: (typeof updatedTask.comments === 'string' ? JSON.parse(updatedTask.comments) : (updatedTask.comments || [])).map((c: any) => ({
                    ...c,
                    timestamp: new Date(c.timestamp)
                }))
             };
             setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        };

        signalRService.on('IncidentCreated', handleIncidentCreated);
        signalRService.on('IncidentUpdated', handleIncidentUpdated);
        signalRService.on('TaskCreated', handleTaskCreated);
        signalRService.on('TaskUpdated', handleTaskUpdated);

        return () => {
            signalRService.off('IncidentCreated', handleIncidentCreated);
            signalRService.off('IncidentUpdated', handleIncidentUpdated);
            signalRService.off('TaskCreated', handleTaskCreated);
            signalRService.off('TaskUpdated', handleTaskUpdated);
        };
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentUserState(prev => ({
      ...prev,
      role,
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    try {
        const newTask = await taskService.createTask({
            incidentId: taskData.incidentId ? parseInt(taskData.incidentId) : undefined, 
            assignedToUserId: parseInt(taskData.assignedTo),
            description: taskData.description,
            dueDate: taskData.dueDate.toISOString()
        });
        setTasks(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
        });
    } catch (error) {
        console.error("Failed to create task", error);
        // todo: show toast
    }
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus, delayReason?: string, delayDate?: Date) => {
      try {
          await taskService.updateTaskStatus(taskId, status); // Call API
          // Local update will happen via SignalR or optimistic update here
          setTasks(prev =>
            prev.map(task =>
              task.id === taskId
                ? (() => {
                  // Maintain delay history without overwriting previous entries
                  let delayHistory: TaskDelayEntry[] = task.delayHistory ?? [];
    
                  if (status === 'Delayed' && delayReason) {
                    const entryDate = delayDate ?? new Date();
                    const newEntry: TaskDelayEntry = {
                      reason: delayReason,
                      date: entryDate,
                    };
                    delayHistory = [...delayHistory, newEntry];
    
                    return {
                      ...task,
                      status,
                      delayHistory,
                      delayReason: newEntry.reason,
                      delayDate: newEntry.date,
                    };
                  }
    
                  const latestEntry = delayHistory[delayHistory.length - 1];
    
                  return {
                    ...task,
                    status,
                    delayHistory,
                    delayReason: latestEntry ? latestEntry.reason : undefined,
                    delayDate: latestEntry ? latestEntry.date : undefined,
                  };
                })()
                : task
            )
          );
      } catch (error) {
          console.error("Failed to update task status", error);
      }
    },
    []
  );

  const addTaskComment = useCallback(async (taskId: string, comment: Omit<TaskComment, 'id' | 'timestamp'>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
        await taskService.addTaskComment(task, comment.text);
        // We rely on SignalR 'TaskUpdated' event to refresh the UI
    } catch (error) {
        console.error("Failed to add task comment", error);
    }
  }, [tasks]);

  const updateTaskDetails = useCallback(
    (
      taskId: string,
      updates: Pick<Task, 'description' | 'area' | 'plant' | 'dueDate' | 'priority' | 'precautions'>
    ) => {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? {
              ...task,
              ...updates,
            }
            : task
        )
      );
    },
    []
  );

  const getFilteredIncidents = useCallback((): Incident[] => {
    let filtered = [...incidents];

    // Time range filter
    if (filters.timeRange !== 'All') {
      const now = new Date();
      const startDate = new Date();

      switch (filters.timeRange) {
        case 'Today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'Weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'Monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'Custom':
          if (filters.customStartDate && filters.customEndDate) {
            filtered = filtered.filter(
              incident =>
                incident.dateTime >= filters.customStartDate! &&
                incident.dateTime <= filters.customEndDate!
            );
          }
          break;
      }

      if (filters.timeRange !== 'Custom') {
        filtered = filtered.filter(incident => incident.dateTime >= startDate);
      }
    }

    // Area filter
    if (filters.areas.length > 0) {
      filtered = filtered.filter(incident => filters.areas.includes(incident.area));
    }

    // Severity filter
    if (filters.severities.length > 0) {
      filtered = filtered.filter(incident => filters.severities.includes(incident.severity));
    }

    // Department filter
    if (filters.departments.length > 0) {
      filtered = filtered.filter(incident => filters.departments.includes(incident.department));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(incident => filters.statuses.includes(incident.status));
    }

    return filtered;
  }, [incidents, filters]);

  const getFilteredTasks = useCallback((): Task[] => {
    const currentUserRole = currentUser.role;

    // Employees only see their own tasks
    if (currentUserRole === 'employee') {
      return tasks.filter(task => task.assignedTo === currentUser.id);
    }

    // Supervisors see all tasks
    return tasks;
  }, [tasks, currentUser]);

  const state: AppState = {
    currentUser,
    incidents,
    tasks,
    users,
    filters,
    safetyResources: [],
    trainingMaterials: [],
    alerts: [],
    emergencyInstructions: [],
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setCurrentUser: setCurrentUserState,
        switchRole,
        updateFilters,
        addTask,
        updateTaskStatus,
        deleteTask,
        addTaskComment,
        updateTaskDetails,
        getFilteredIncidents,
        getFilteredTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

