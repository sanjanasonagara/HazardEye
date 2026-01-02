// Mock Database Service for Prototype
import * as SQLite from 'expo-sqlite';

export interface Incident {
    id: string;
    created_at: string;
    media_uris: string; // JSON string of string[]
    ml_metadata: string; // JSON string
    advisory: string;
    severity: number;
    sync_status: string;
    status: string;
    note: string;
    department: string;
    area: string;
    plant: string;
}

export interface Task {
    id: string;
    title: string;
    assignee: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    status: string;
    due_date: string;
    comments: string;
    area: string;
    plant: string;
    precautions: string;
    incident_id?: string;
    delayReason?: string;
    created_at?: string;
    createdBy?: string;
    createdByName?: string;
    assignedToName?: string;
    delayHistory?: Array<{ date: string; reason: string }>;
}

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    userRole: string;
    content: string;
    timestamp: string;
}

// Initial Mock Data (Empty now as we use real managed data)
let incidents: Incident[] = [];
let tasks: Task[] = [];

export const initDatabase = () => {
    console.log('Database initialized (Mock Mode)');
};

export const getAllIncidents = (): Incident[] => {
    return [...incidents];
};

export const getIncidentById = (id: string): Incident | null => {
    return incidents.find(i => i.id === id) || null;
};

export const updateIncidentStatus = (id: string, status: string) => {
    const idx = incidents.findIndex(i => i.id === id);
    if (idx !== -1) {
        incidents[idx] = { ...incidents[idx], status };
    }
};

export const getTasks = (): Task[] => {
    return [...tasks];
};

export const createTask = (task: Task) => {
    tasks.push(task);
};

export const getTaskById = (id: string): Task | null => {
    return tasks.find(t => t.id === id) || null;
};

export const updateTaskStatus = (id: string, status: string, delayReason?: string, delayDate?: Date) => {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        tasks[idx] = {
            ...tasks[idx],
            status,
            delayReason: delayReason || tasks[idx].delayReason,
            delayHistory: delayReason ? [...(tasks[idx].delayHistory || []), { date: new Date().toISOString(), reason: delayReason }] : tasks[idx].delayHistory
        };
    }
};

export const updateTaskDetails = (id: string, updates: Partial<Task>) => {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...updates };
    }
};

export const deleteTask = (id: string) => {
    tasks = tasks.filter(t => t.id !== id);
};

export const addTaskComment = (id: string, comment: TaskComment) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const comments = JSON.parse(task.comments || '[]');
        comments.push(comment);
        task.comments = JSON.stringify(comments);
        console.log(`Added comment to task ${id}`);
    }
};

export const reportTaskDelay = (id: string, reason: string) => {
    console.log(`Reporting delay for task ${id}: ${reason}`);
};

export const getPendingIncidents = (): Incident[] => {
    return incidents.filter(i => i.sync_status === 'pending');
};

export const updateIncident = (incident: Incident) => {
    const idx = incidents.findIndex(i => i.id === incident.id);
    if (idx !== -1) {
        incidents[idx] = incident;
    }
};

export const saveIncident = (incident: Incident) => {
    incidents.push(incident);
};

export const deleteIncident = (id: string) => {
    incidents = incidents.filter(i => i.id !== id);
};
