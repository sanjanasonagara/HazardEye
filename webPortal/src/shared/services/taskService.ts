import { fetchApi } from './api';
import { Task, Priority, TaskStatus } from '../../supervisor/types';

export interface WorkTaskDto {
    id: number;
    title: string;
    incidentId?: number;
    departmentId: number;
    departmentName: string;
    assignedToUserId: number;
    assignedToName: string;
    description: string;
    status: string;
    priority: number;
    createdAt: string;
    dueDate?: string;
    completedAt?: string;
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

    // Additional methods like createTask, updateTaskStatus could be added here
};

const mapDtoToTask = (dto: WorkTaskDto): Task => {
    return {
        id: dto.id.toString(),
        incidentId: dto.incidentId?.toString(),
        description: dto.description || dto.title, // Fallback to title if description is empty
        area: dto.departmentName, // Using Department as Area for now
        plant: 'General', // Default if not provided
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(),
        priority: mapPriority(dto.priority),
        status: dto.status as TaskStatus,
        precautions: 'Refer to safety guidelines.', // Generic default
        assignedTo: dto.assignedToUserId.toString(),
        assignedToName: dto.assignedToName,
        createdBy: '0', // Unknown
        createdByName: 'System', // Unknown
        createdAt: new Date(dto.createdAt),
        comments: [], // Not in DTO
    };
};

const mapPriority = (p: number): Priority => {
    if (p >= 3) return 'High';
    if (p === 2) return 'Medium';
    return 'Low';
};
