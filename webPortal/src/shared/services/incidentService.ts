import { fetchApi } from './api';
import { Incident } from '../../supervisor/types';

// Matching backend DTO
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
    plant?: string;
    area?: string;
    plantLocationId?: number;
    plantLocationName?: string;
    areaLocationId?: number;
    areaLocationName?: string;
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
    },

    updateIncident: async (id: string, updates: Partial<Incident>): Promise<void> => {
        // Backend expects PUT /api/incidents/{id} likely with full object or patch
        // Given structure, we might need to send DTO.
        // Assuming there's a PUT endpoint.
        await fetchApi(`/incidents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
};

// Helper: Map DTO to Frontend Model
const mapDtoToIncident = (dto: IncidentDto): Incident => {
    return {
        id: dto.id.toString(),
        // Use the first media URI if available, otherwise placeholder. 
        // Note: Backend might return relative paths or full URLs. 
        // If it returns full URL (which it does now for uploads), use it directly.
        imageUrl: dto.mediaUris && dto.mediaUris.length > 0 ? dto.mediaUris[0] : 'https://via.placeholder.com/150',
        dateTime: new Date(dto.capturedAt),
        area: dto.areaLocationName || dto.area || '',
        plant: dto.plantLocationName || dto.plant || '',
        plantLocationId: dto.plantLocationId,
        areaLocationId: dto.areaLocationId,
        department: mapCategoryToDepartment(dto.category), // Map category to department
        severity: (dto.severity as any) || 'Low',
        status: (dto.status as any) || 'Open',
        description: dto.note || dto.category || `Incident detected by ${dto.deviceId}`,
        advisory: dto.advisory,
    };
};

const mapCategoryToDepartment = (category: string): any => {
    if (category?.includes('Fire') || category?.includes('Smoke')) return 'Fire & Safety';
    if (category?.includes('Equip') || category?.includes('Machine')) return 'Mechanical';
    if (category?.includes('Spill') || category?.includes('Leak')) return 'Environmental';
    return 'General';
};
