export interface Location {
    id: string; // immutable
    name: string;
    latitude: number;
    longitude: number;
    active: boolean;
    quadrant?: 'NE' | 'NW' | 'SE' | 'SW';
    description?: string;
    type?: 'Plant' | 'Unit' | 'Area' | 'Other';
    parentLocationId?: string;
    parentLocationName?: string;
    polygonCoordinates?: [number, number][];
}
