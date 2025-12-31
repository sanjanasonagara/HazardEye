import { fetchApi } from './api';
import { Incident } from '../../supervisor/types';

// Matching backend DTO
export interface IncidentDto {
    id: number;
    serverIncidentId: string;
    deviceId: string;
    incidentId?: string; // Client provided ID
    capturedAt: string; // ISO Date
    severity: string;
    category: string;
    status: string;
    assignedTo?: number;
    assignedToName?: string;
    createdBy: number;
    createdByName: string;
    mediaUris: string[];
    mlMetadata: Record<string, any>;
    advisory?: string;
    note?: string;
    createdAt: string;
    resolvedAt?: string;
    closedAt?: string;
    comments: any[];
    correctiveActions: any[];
}

export interface IncidentListResponse {
    items: IncidentDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const incidentService = {
    getIncidents: async (): Promise<Incident[]> => {
        try {
            const response = await fetchApi<IncidentListResponse>('/incidents?PageSize=100'); // Fetch enough for now
            return response.items.map(mapDtoToIncident);
        } catch (error) {
            console.error('Failed to fetch incidents:', error);
            throw error;
        }
    },

    getIncident: async (id: number): Promise<Incident | null> => {
        try {
            const response = await fetchApi<IncidentDto>(`/incidents/${id}`);
            return mapDtoToIncident(response);
        } catch (error) {
            console.error(`Failed to fetch incident ${id}:`, error);
            return null;
        }
    }
};

// Helper: Map DTO to Frontend Model
const mapDtoToIncident = (dto: IncidentDto): Incident => {
    return {
        id: dto.id.toString(),
        imageUrl: dto.mediaUris.length > 0 ? getMediaUrl(dto.id, 0) : 'https://via.placeholder.com/150', // Placeholder or constructed URL
        dateTime: new Date(dto.capturedAt),
        area: 'Unknown Area', // Backend doesn't provide Area yet (Device mapping needed)
        plant: 'Refinery A', // Placeholder
        department: 'General', // Placeholder
        severity: (dto.severity as any) || 'Low',
        status: (dto.status as any) || 'Open',
        description: dto.note || dto.category || 'No description provided',

    };
};

const getMediaUrl = (_incidentId: number, _mediaIndex: number) => {
    // This should ideally call the presigned URL endpoint.
    // For now, we return a direct pointer if we can, or just empty for simplicity 
    // since we need an async call to get the signed URL.
    // A better approach is to have the Image component fetch the URL.
    // For now, let's use a placeholder or handle it in the component.
    return 'https://via.placeholder.com/150?text=No+Image';
};
