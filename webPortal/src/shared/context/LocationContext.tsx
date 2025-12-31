import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Location } from '../types/Location';
import { locationService } from '../services/locationService';

interface LocationContextType {
    locations: Location[];
    isLoading: boolean;
    error: string | null;
    refreshLocations: () => Promise<void>;
    addLocation: (location: Omit<Location, 'id'>) => Promise<void>;
    updateLocation: (id: string, updates: Partial<Omit<Location, 'id'>>) => Promise<void>;
    deleteLocation: (id: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocations = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocations must be used within a LocationProvider');
    }
    return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await locationService.getAllLocations();
            setLocations(data);
        } catch (err) {
            setError('Failed to fetch locations');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    // Admin Actions
    const addLocation = async (location: Omit<Location, 'id'>) => {
        try {
            await locationService.createLocation(location);
            await fetchLocations(); // Sync local state
        } catch (err) {
            console.error('Failed to create location', err);
            throw err;
        }
    };

    const updateLocation = async (id: string, updates: Partial<Omit<Location, 'id'>>) => {
        try {
            await locationService.updateLocation(id, updates);
            await fetchLocations();
        } catch (err) {
            console.error('Failed to update location', err);
            throw err;
        }
    };

    const deleteLocation = async (id: string) => {
        try {
            await locationService.deleteLocation(id);
            await fetchLocations();
        } catch (err) {
            console.error('Failed to delete location', err);
            throw err;
        }
    };

    return (
        <LocationContext.Provider value={{
            locations,
            isLoading,
            error,
            refreshLocations: fetchLocations,
            addLocation,
            updateLocation,
            deleteLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
};
