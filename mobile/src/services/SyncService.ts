import { getPendingIncidents, markIncidentUploaded, getPendingTasks, markTaskUploaded, updateIncidentServerId, updateTaskServerId, getTaskById, createTask } from './Database';
import api from './api';
import { Alert } from 'react-native';

let isSyncing = false;

export const syncData = async (onSyncComplete?: () => void) => {
    if (isSyncing) return;
    isSyncing = true;

    try {
        const pendingIncidents = await getPendingIncidents();
        const pendingTasks = await getPendingTasks();
        let syncedCount = 0;
 
        if (pendingIncidents.length > 0 || pendingTasks.length > 0) {

            // Sync Incidents
            for (const incident of pendingIncidents) {
                try {
                    const mediaUris = JSON.parse(incident.media_uris || '[]');
                    const uploadedMediaUrls: string[] = [];

                    // Upload Media first
                    for (const uri of mediaUris) {
                        if (!uri) continue; // Skip empty strings
                        
                        // If it's a local file (file://, content://, or just a path), upload it
                        if (!uri.startsWith('http')) {
                            console.log(`[SyncService] Uploading media: ${uri}`);
                            try {
                                const uploadUrl = await uploadMedia(uri);
                                if (uploadUrl) {
                                    console.log(`[SyncService] Upload success: ${uploadUrl}`);
                                    uploadedMediaUrls.push(uploadUrl);
                                } else {
                                    console.warn(`[SyncService] Upload returned null for ${uri}`);
                                    // Do not push local URI if upload fails, to avoid backend pollution
                                }
                            } catch (err) {
                                console.error(`Failed to upload media ${uri}`, err);
                            }
                        } else {
                            // Already a server URL
                             console.log(`[SyncService] Skipping upload for existing URL: ${uri}`);
                            uploadedMediaUrls.push(uri);
                        }
                    }

                    const payload = {
                        deviceId: "DEV-MOBILE-001",
                        incidentId: incident.id,
                        capturedAt: incident.created_at,
                        mediaUris: uploadedMediaUrls,
                        mlMetadata: JSON.parse(incident.ml_metadata || '{}'),
                        severity: incident.severity >= 3 ? "High" : incident.severity >= 2 ? "Medium" : "Low",
                        category: incident.department || "Other",
                        advisory: incident.advisory,
                        note: incident.note,
                        status: incident.status,
                        area: incident.area,
                        plant: incident.plant
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
                    // If we have a server ID, we use it for checking, but for now we follow the string ID pattern.
                    const payload = {
                        id: task.id,
                        title: task.title,
                        assignee: task.assignee,
                        description: task.description,
                        priority: task.priority,
                        status: task.status,
                        dueDate: task.due_date ? task.due_date : null,
                        comments: task.comments,
                        area: task.area,
                        plant: task.plant,
                        precautions: task.precautions,
                        incidentId: task.incident_id,
                        delayReason: task.delay_reason,
                        // Send server_id if we have it, though backend currently ignores it in favor of 'id' string matching
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
                // Fallback to Alert since expo-notifications is restricted in Expo Go on Android
                Alert.alert("Sync Complete", `All pending data (${syncedCount} items) has been uploaded.`);
            }
        }

        // --- DOWNLOAD SYNC ---
        // Fetch latest tasks from server
        try {
            console.log('[SyncService] Fetching tasks from server...');
            const response = await api.get('/tasks');
            
            console.log('[SyncService] Get Tasks Response Status:', response.status);
            console.log('[SyncService] Get Tasks Response Data Length:', response.data?.length);

            if (response.data && Array.isArray(response.data)) {
                const serverTasks = response.data;
                let newCount = 0;
                
                for (const st of serverTasks) {
                    console.log(`[SyncService] Processing task: ${st.id} - ${st.description}`);
                    
                    // Check if exists
                    const existing = await getTaskById(st.id.toString()); 
                    console.log(`[SyncService] Existing task match: ${!!existing}`);

                    const taskToSave: any = {
                        id: st.id.toString(),
                        server_id: st.id,
                        title: st.description ? st.description.substring(0, 50) : 'Task', 
                        description: st.description,
                        assignee: st.assignedToName,
                        priority: 'medium', 
                        status: st.status,
                        due_date: st.dueDate,
                        area: 'General', 
                        plant: 'General',
                        incident_id: st.incidentId ? st.incidentId.toString() : '', // Missing mapping added
                        comments: st.comments || '[]',
                        sync_status: 'synced'
                    };

                    if (!existing) {
                        try {
                           console.log(`[SyncService] Saving new task: ${taskToSave.id}`);
                           await import('./Database').then(db => db.createTask(taskToSave)); 
                           newCount++;
                        } catch (e) { console.error('Error saving downloaded task', e); }
                    } else {
                         // Update status if server is different and we don't have pending local changes
                         if (existing.status !== st.status && existing.sync_status !== 'pending') {
                             console.log(`[SyncService] Updating local task ${existing.id} status: ${existing.status} -> ${st.status}`);
                             // We need a way to update just status without triggering sync_status='pending' again?
                             // OR we permit it and let it sync back (redundant but safe).
                             // Better: database function 'updateTaskFromSync' that sets sync_status='synced'.
                             // For now, use updateTaskDetails helper or similar logic.
                             // Actually, let's just use updateTaskStatus but we need to ensure we mark it synced or it will bounce back.
                             // Let's use a direct import of db to run a custom query or add a helper.
                             // We'll use import('./Database') to access db helpers dynamically.
                             
                             await import('./Database').then(async db => {
                                 // We really need a method to update FROM SERVER (setting sync_status='synced')
                                 // Since we don't have one, let's use a direct SQL via a new exported function or just force it.
                                 // Let's add 'markTaskSynced' logic effectively.
                                 // For now: updateTaskStatus sets it to pending. We can then markTaskUploaded immediately? No, race condition.
                                 // Best approach: Add 'updateTaskFromServer' to Database.ts. 
                                 // Since I can't edit Database.ts in this tool call easily (multi-file), I will assume I can edit Database.ts next.
                                 // But I can define the intent here.
                                 // Workaround: We will use updateTaskStatus then manually markUploaded.
                                 // Or better, let's just make the sync logic robust in Database.ts later.
                                 // Actually, I'll assume I can add a specific helper in Database.ts.
                                 // Let's temporarily skip the complex safe-guard and just log it for now, 
                                 // or better, try to use updateTaskDetails if it doesn't set pending?
                                 // updateTaskDetails in Database.ts: `UPDATE tasks SET ${setClause} WHERE id = ?`. 
                                 // It does NOT set sync_status = 'pending' automatically! It's a raw update.
                                 // PERFECT.
                                 
                                 await db.updateTaskDetails(existing.id, { 
                                     status: st.status, 
                                     sync_status: 'synced' // Explicitly keep it synced
                                 });
                             });
                         }
                    }
                }
                
                console.log(`[SyncService] Download complete. New tasks: ${newCount}`);
                
                // --- STALE TASK CLEANUP ---
                // Fetch all local tasks that were originally downloaded from server (have server_id)
                // but are no longer in the server list.
                const localTasks = await (await import('./Database')).getTasks();
                const serverTaskIds = new Set(serverTasks.map((st: any) => st.id.toString()));
                
                let deletedCount = 0;
                for (const lt of localTasks) {
                    // Only cleanup tasks that have a server_id (i.e., not local-only pending tasks)
                    // and are not in the current server result.
                    if (lt.server_id && !serverTaskIds.has(lt.id)) {
                        console.log(`[SyncService] ℹ️ Removing stale task from local DB: ${lt.id}`);
                        await (await import('./Database')).deleteTask(lt.id);
                        deletedCount++;
                    }
                }
                
                if (deletedCount > 0) {
                    console.log(`[SyncService] Cleanup complete. Removed ${deletedCount} stale tasks.`);
                }

                if (newCount > 0) {
                     Alert.alert("New Tasks", `${newCount} new tasks downloaded.`);
                }
            } else {
                console.warn('[SyncService] Invalid response data format:', response.data);
            }
        } catch (downloadError: any) {
            console.error('[SyncService] Download failed', downloadError);
            if (downloadError.response) {
                console.error('[SyncService] Error Status:', downloadError.response.status);
                console.error('[SyncService] Error Data:', downloadError.response.data);
            }
        }

        if (syncedCount > 0 || (onSyncComplete)) {
            if (onSyncComplete) onSyncComplete();
        }
    } catch (error) {
        console.error('Error in syncData:', error);
    } finally {
        isSyncing = false;
    }
};

const uploadMedia = async (fileUri: string): Promise<string | null> => {
    try {
        const formData = new FormData();
        const filename = fileUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
            uri: fileUri,
            name: filename,
            type
        } as any);

        const response = await api.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data && response.data.url) {
            return response.data.url;
        }
    } catch (error) {
        console.error('Error uploading media:', error);
    }
    return null;
};
