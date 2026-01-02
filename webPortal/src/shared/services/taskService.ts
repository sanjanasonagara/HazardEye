import { fetchApi } from './api';
import { Task, TaskStatus } from '../../supervisor/types';

export interface WorkTaskDto {
    id: number;
    incidentId?: number;
    assignedToUserId: number;
    assignedToName: string;
    description: string;
    status: string;
    createdAt: string;
    dueDate?: string;
    completedAt?: string;
    comments: string;
    plantLocationId?: number;
    plantLocationName?: string;
    areaLocationId?: number;
    areaLocationName?: string;
}

export interface CreateTaskDto {
    incidentId?: number;
    assignedToUserId: number;
    description: string;
    dueDate?: string;
}

export const taskService = {
    getTasks: async (): Promise<Task[]> => {
        try {
            const dtos = await fetchApi<WorkTaskDto[]>('/tasks');
            return dtos.map(mapDtoToTask);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }
    },

    createTask: async (task: CreateTaskDto): Promise<Task> => {
        const response = await fetchApi<WorkTaskDto>('/tasks', {
            method: 'POST',
            body: JSON.stringify(task)
        });
        return mapDtoToTask(response);
    },

    updateTaskStatus: async (taskId: string, status: string): Promise<void> => {
        await fetchApi(`/tasks/${taskId}/status`, {
            method: 'PUT',
            body: JSON.stringify(status)
        });
    },

    addTaskComment: async (task: Task, commentText: string): Promise<void> => {
        const timestamp = new Date().toISOString();
        const updatedComments = [...task.comments, { text: commentText, timestamp }];
        
        await fetchApi('/tasks/sync', {
            method: 'POST',
            body: JSON.stringify({
                id: task.id,
                description: task.description,
                status: task.status,
                dueDate: task.dueDate.toISOString(),
                comments: JSON.stringify(updatedComments),
                assignee: task.assignedToName
            })
        });
    }
};

const mapDtoToTask = (dto: WorkTaskDto): Task => {
    return {
        id: dto.id.toString(),
        incidentId: dto.incidentId?.toString(),
        description: dto.description || 'Task #' + dto.id,
        area: dto.areaLocationName || 'General',
        plant: dto.plantLocationName || 'Main Plant',
        plantLocationId: dto.plantLocationId,
        areaLocationId: dto.areaLocationId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(),
        priority: 'Medium', // Default as backend doesn't store priority yet
        status: dto.status as TaskStatus,
        precautions: 'Refer to safety guidelines.',
        assignedTo: dto.assignedToUserId.toString(),
        assignedToName: dto.assignedToName,
        createdBy: '0',
        createdByName: 'System',
        createdAt: new Date(dto.createdAt),
        delayHistory: (dto as any).delayHistory ? (dto as any).delayHistory.map((h: any) => ({
            ...h,
            date: new Date(h.date)
        })) : [],
        comments: dto.comments ? JSON.parse(dto.comments).map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp)
        })) : [],
    };
};
