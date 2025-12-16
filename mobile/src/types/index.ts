export interface UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: UserDto;
}

export interface IncidentDto {
    id: number;
    serverIncidentId: string;
    deviceId: string;
    incidentId: string | null;
    capturedAt: string; // ISO Date string
    severity: string;
    category: string;
    status: string;
    assignedTo: number | null;
    assignedToName?: string | null;
    createdBy: number;
    createdByName: string;
    mediaUris: string[];
    mlMetadata: Record<string, any>;
    advisory: string | null;
    note: string | null;
    createdAt: string;
    resolvedAt?: string | null;
    closedAt?: string | null;
    comments: CommentDto[];
    correctiveActions: CorrectiveActionDto[];
}

export interface CommentDto {
    id: number;
    userId: number;
    userName: string;
    comment: string;
    createdAt: string;
}

export interface CorrectiveActionDto {
    id: number;
    action: string;
    dueDate: string;
    completed: boolean;
    completedAt?: string | null;
}
