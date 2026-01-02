import { getPendingIncidents, markIncidentUploaded, getPendingTasks, markTaskUploaded, updateIncidentServerId, updateTaskServerId, getIncidentById, saveIncident, getTaskById, createTask, saveLocations, saveUsers, updateTaskDetails } from './Database';
import api from './api';
import { Alert } from 'react-native';

let isSyncing = false;

export const syncData = async (onSyncComplete?: () => void) => {
    if (isSyncing) return;
    isSyncing = true;

    try {
        await pushData();
        await pullData();

        if (onSyncComplete) {
            onSyncComplete();
        }
    } catch (error) {
        console.error('Error in syncData:', error);
    } finally {
        isSyncing = false;
    }
};

const pushData = async () => {
    const pendingIncidents = await getPendingIncidents();
    const pendingTasks = await getPendingTasks();

    if (pendingIncidents.length === 0 && pendingTasks.length === 0) {
        return;
    }

    let syncedCount = 0;

    // Sync Incidents
    for (const incident of pendingIncidents) {
        try {
            const localMediaUris = JSON.parse(incident.media_uris || '[]') as string[];
            const serverMediaUris: string[] = [];

            // 1. Upload images to server first
            for (const uri of localMediaUris) {
                if (!uri || uri.startsWith('http')) {
                    if (uri) serverMediaUris.push(uri);
                    continue;
                }

                try {
                    const formData = new FormData();
                    // React Native FormData requires specific object for files
                    const fileName = uri.split('/').pop() || 'upload.jpg';
                    const fileType = fileName.split('.').pop() === 'png' ? 'image/png' : 'image/jpeg';
                    
                    formData.append('file', {
                        uri: uri,
                        name: fileName,
                        type: fileType,
                    } as any);

                    const uploadRes = await api.post('/media/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    if (uploadRes.data && uploadRes.data.url) {
                        serverMediaUris.push(uploadRes.data.url);
                    }
                } catch (err) {
                    console.error('Failed to upload image:', uri, err);
                }
            }

            // 2. Sync Incident details
            const payload = {
                deviceId: "DEV-MOBILE-001",
                incidentId: incident.id,
                capturedAt: incident.created_at,
                mediaUris: serverMediaUris,
                mlMetadata: JSON.parse(incident.ml_metadata || '{}'),
                severity: incident.severity >= 3 ? "High" : incident.severity >= 2 ? "Medium" : "Low",
                category: incident.department || "Other",
                advisory: incident.advisory || "Observation reported from mobile",
                note: incident.note || "No details provided",
                status: incident.status,
                area: incident.area || "Main Refinery",
                plant: incident.plant || incident.area || "Unit 1"
            };

            const response = await api.post('/incidents', payload);
            if (response.data && response.data.id) {
                await updateIncidentServerId(incident.id, response.data.id);
            } else {
                await markIncidentUploaded(incident.id);
            }
            syncedCount++;
        } catch (error) {
            console.error(`Failed to sync incident ${incident.id}`, error);
        }
    }

    // Sync Tasks
    for (const task of pendingTasks) {
        try {
            const payload = {
                id: task.id,
                title: task.title,
                assignee: task.assignee,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.due_date ? task.due_date : null,
                comments: JSON.parse(task.comments || '[]'),
                area: task.area,
                plant: task.plant,
                precautions: task.precautions,
                incidentId: task.incident_id,
                delayReason: task.delay_reason,
                serverId: task.server_id 
            };

            const response = await api.post('/tasks/sync', payload);
            if (response.data && response.data.id) {
                await updateTaskServerId(task.id, response.data.id);
            } else {
                await markTaskUploaded(task.id);
            }
            syncedCount++;
        } catch (error) {
            console.error(`Failed to sync task ${task.id}`, error);
        }
    }

    if (syncedCount > 0) {
        Alert.alert("Sync Complete", `Pushed ${syncedCount} items to server.`);
    }
};

const pullData = async () => {
    try {
        // 1. Fetch Locations
        const locRes = await api.get('/locations');
        if (Array.isArray(locRes.data)) {
            await saveLocations(locRes.data);
        }

        // 2. Fetch Users (Employees)
        const userRes = await api.get('/users');
        if (Array.isArray(userRes.data)) {
            const mappedUsers = userRes.data.map((u: any) => ({
                id: String(u.id),
                employee_id: u.employeeId,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                role: u.role,
                department: u.company || u.department
            }));
            await saveUsers(mappedUsers);
        }

        // 3. Fetch Incidents
        const incidentsResponse = await api.get('/incidents?pageSize=50');
        if (incidentsResponse.data && incidentsResponse.data.items) {
            for (const item of incidentsResponse.data.items) {
                const existing = await getIncidentById(item.incidentId || `INC-${item.id}`);
                if (!existing) {
                    await saveIncident({
                        id: item.incidentId || `INC-${item.id}`,
                        server_id: item.id,
                        created_at: item.capturedAt || item.createdAt,
                        media_uris: JSON.stringify(item.mediaUris || []),
                        severity: item.severity === 'High' || item.severity === 'Critical' ? 3 : item.severity === 'Medium' ? 2 : 1,
                        sync_status: 'synced',
                        status: item.status?.toLowerCase() || 'open',
                        note: item.note || item.advisory || '',
                        advisory: item.advisory || '',
                        department: item.category || 'Other',
                        area: item.area || 'Field',
                        plant: item.plant || 'General'
                    });
                }
            }
        }

        // 3. Fetch Tasks
        const tasksResponse = await api.get('/tasks');
        if (Array.isArray(tasksResponse.data)) {
            for (const item of tasksResponse.data) {
                const existing = await getTaskById(String(item.id));
                if (!existing) {
                    await createTask({
                        id: String(item.id),
                        server_id: item.id,
                        title: item.description?.substring(0, 30) || 'Task',
                        assignee: item.assignedToName || 'Unassigned',
                        description: item.description || '',
                        priority: item.priority?.toLowerCase() || 'medium',
                        status: item.status?.toLowerCase() || 'pending',
                        due_date: item.dueDate || '',
                        comments: item.comments || '[]',
                        area: item.area || 'Main Site', 
                        plant: item.plant || 'General',
                        precautions: 'Follow safety guidelines',
                        sync_status: 'synced'
                    });
                } else {
                    // Update existing task with latest comments from server
                    await updateTaskDetails(String(item.id), {
                        comments: item.comments || existing.comments || '[]'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Failed to pull data from CMS:', error);
    }
};
