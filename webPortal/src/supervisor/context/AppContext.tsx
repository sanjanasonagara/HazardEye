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
  const [users] = useState<User[]>([]); // mockUsers removed
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
        console.log('AppContext: Parsed user:', user);
        return user as User;
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    }
    // Default to empty/null user or force redirect in UI if checking this
    console.log('AppContext: defaulting to empty user');
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
        const [incidentsData, tasksData] = await Promise.all([
          incidentService.getIncidents(),
          taskService.getTasks()
        ]);

        setIncidents(incidentsData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to load data from API", error);
        // Fallback to empty
        setIncidents([]);
        setTasks([]);
      }
    };
    fetchData();
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

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      comments: [],
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus, delayReason?: string, delayDate?: Date) => {
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
                  // Keep single-value fields in sync with latest entry for existing UI
                  delayReason: newEntry.reason,
                  delayDate: newEntry.date,
                };
              }

              // For non-delayed status updates, preserve full history and latest displayed values
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
    },
    []
  );

  const addTaskComment = useCallback((taskId: string, comment: Omit<TaskComment, 'id' | 'timestamp'>) => {
    const newComment: TaskComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      timestamp: new Date(),
    };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, comments: [...task.comments, newComment] }
          : task
      )
    );
  }, []);

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

