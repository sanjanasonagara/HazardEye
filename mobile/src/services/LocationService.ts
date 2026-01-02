import api from './api';

export interface Location {
    id: string;
    name: string;
    type: string;
    parentLocationId?: string;
    parentLocationName?: string;
    latitude: number;
    longitude: number;
    active: boolean;
}

export const locationService = {
    getLocations: async (): Promise<Location[]> => {
        try {
            console.log('[LocationService] Fetching locations...');
            const response = await api.get<any[]>('/locations');
            console.log('[LocationService] Raw response length:', response.data?.length);
            
            const mapped = response.data.map(item => ({
                id: item.id.toString(),
                name: item.name,
                type: item.type,
                parentLocationId: item.parentId ? item.parentId.toString() : undefined,
                parentLocationName: item.parentName,
                latitude: item.latitude,
                longitude: item.longitude,
                active: item.isActive
            }));
            
            console.log('[LocationService] Mapped locations count:', mapped.length);
            return mapped;
        } catch (error) {
            console.error('[LocationService] Failed to fetch locations', error);
            throw error;
        }
    }
};
