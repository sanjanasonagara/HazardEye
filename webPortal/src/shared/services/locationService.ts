import { fetchApi } from './api';
import { Location } from '../types/Location';

export interface LocationDto {
    id: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    polygonCoordinates?: string;
    type?: string;
    isActive: boolean;
    parentId?: number;
    parentName?: string;
}

export const locationService = {
    getAllLocations: async (): Promise<Location[]> => {
        try {
            const dtos = await fetchApi<LocationDto[]>('/locations');
            return dtos.map(mapDtoToLocation);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
            throw error;
        }
    },

    getLocation: async (id: string): Promise<Location> => {
        const dto = await fetchApi<LocationDto>(`/locations/${id}`);
        return mapDtoToLocation(dto);
    },

    createLocation: async (location: Omit<Location, 'id'>): Promise<Location> => {
        const dto = mapLocationToDto(location);
        const response = await fetchApi<LocationDto>('/locations', {
            method: 'POST',
            body: JSON.stringify(dto)
        });
        return mapDtoToLocation(response);
    },

    updateLocation: async (id: string, updates: Partial<Omit<Location, 'id'>>): Promise<Location> => {
        const current = await locationService.getLocation(id);
        const updated: Location = {
            ...current,
            ...updates
        };
        return locationService.updateLocationFull(updated);
    },

    updateLocationFull: async (location: Location): Promise<Location> => {
        const dto = mapLocationToDto(location);
        await fetchApi(`/locations/${location.id}`, {
            method: 'PUT',
            body: JSON.stringify(dto)
        });
        return location;
    },

    deleteLocation: async (id: string): Promise<void> => {
        await fetchApi(`/locations/${id}`, {
            method: 'DELETE'
        });
    }
};

const mapDtoToLocation = (dto: LocationDto): Location => ({
    id: dto.id.toString(),
    name: dto.name,
    latitude: dto.latitude,
    longitude: dto.longitude,
    active: dto.isActive,
    description: dto.description,
    type: dto.type as any,
    parentLocationId: dto.parentId?.toString(),
    parentLocationName: dto.parentName,
    polygonCoordinates: dto.polygonCoordinates ? JSON.parse(dto.polygonCoordinates) : undefined
});

const mapLocationToDto = (loc: Partial<Location>): any => ({
    id: loc.id ? parseInt(loc.id) : 0,
    name: loc.name,
    description: loc.description || '',
    latitude: loc.latitude,
    longitude: loc.longitude,
    isActive: loc.active !== undefined ? loc.active : true,
    type: loc.type,
    parentId: loc.parentLocationId ? parseInt(loc.parentLocationId) : null,
    polygonCoordinates: loc.polygonCoordinates ? JSON.stringify(loc.polygonCoordinates) : null
});
