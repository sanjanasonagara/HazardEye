import { getPendingIncidents, markIncidentUploaded } from './Database';
import api from './api'; // Real API client
import { IncidentDto } from '../types';

export const syncIncidents = async () => {
    const pending = getPendingIncidents();

    if (pending.length === 0) {
        console.log("No pending incidents to sync.");
        return;
    }

    console.log(`Syncing ${pending.length} incidents...`);

    for (const incident of pending) {
        try {
            // 1. Upload Media (Placeholder)
            // In a real app, upload files first and get URLs

            // 2. Prepare Payload (Map local Incident to IncidentDto)
            // Note: We need to match the key names expected by the backend (PascalCase or camelCase depending on serialization)
            // The backend uses camelCase by default in .NET Core + JS clients.
            const payload = {
                deviceId: "DEV-MOBILE-001", // Should come from secure store or config
                incidentId: incident.id,
                capturedAt: incident.created_at,
                severity: incident.severity.toString(), // Map number to string if needed, or check logic
                // ... map other fields
                mediaUris: JSON.parse(incident.media_uris),
                mlMetadata: JSON.parse(incident.ml_metadata),
                note: incident.note,
                advisory: incident.advisory
            };

            // 3. Send to Backend
            await api.post('/incidents', payload);

            console.log(`Uploaded incident ${incident.id}`);

            // 4. Mark as Uploaded
            markIncidentUploaded(incident.id);

        } catch (error) {
            console.error(`Failed to sync incident ${incident.id}`, error);
        }
    }
};
