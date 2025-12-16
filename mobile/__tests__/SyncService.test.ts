import { syncIncidents } from '../src/services/SyncService';
import { getPendingIncidents, markIncidentUploaded } from '../src/services/Database';

// Mock dependencies
jest.mock('../src/services/Database', () => ({
    getPendingIncidents: jest.fn(),
    markIncidentUploaded: jest.fn(),
}));

/*
jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn(),
}));
*/

const mockPending = [
    { id: '1', media_uris: '[]', ml_metadata: '{}', sync_status: 'pending' },
    { id: '2', media_uris: '[]', ml_metadata: '{}', sync_status: 'pending' },
];

describe('SyncService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should sync all pending incidents', async () => {
        (getPendingIncidents as jest.Mock).mockReturnValue(mockPending);

        await syncIncidents();

        expect(getPendingIncidents).toHaveBeenCalled();
        // In our simplified SyncService, we just loop and succeed
        expect(markIncidentUploaded).toHaveBeenCalledTimes(2);
        expect(markIncidentUploaded).toHaveBeenCalledWith('1');
        expect(markIncidentUploaded).toHaveBeenCalledWith('2');
    });

    it('should do nothing if no pending incidents', async () => {
        (getPendingIncidents as jest.Mock).mockReturnValue([]);

        await syncIncidents();

        expect(markIncidentUploaded).not.toHaveBeenCalled();
    });
});
