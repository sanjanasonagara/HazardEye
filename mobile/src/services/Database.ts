import * as SQLite from 'expo-sqlite';

// ... existing imports

export interface Incident {
    id: string;
    server_id?: number; // Added server_id
    created_at: string;
    media_uris: string;
    severity: number;
    sync_status: 'pending' | 'synced';
    status: string;
    note: string;
    department?: string;
    area?: string;
    plant?: string;
    ml_metadata?: string;
    advisory?: string;
}

export interface Task {
    id: string;
    server_id?: number; // Added server_id
    title: string;
    assignee: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: string;
    due_date: string;
    comments: string;
    area: string;
    plant: string;
    precautions: string;
    incident_id?: string;
    delay_reason?: string;
    delayed_at?: string;
    delay_history?: string; // JSON string of { reason: string, timestamp: string }[]
    sync_status?: 'pending' | 'synced';
}

export interface Location {
    id: number;
    name: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    type?: string;
    parent_id?: number;
    parent_name?: string;
}

export interface MobileUser {
    id: string;
    employee_id?: string;
    name: string;
    email: string;
    role: string;
    department?: string;
}

export interface Device {
    id: string;
    name: string;
    model: string;
    station: string;
    last_sync: string;
    battery_level: number;
    storage_used: string;
    model_version: string;
    model_updated: string;
}

let db: SQLite.SQLiteDatabase;
let initPromise: Promise<void> | null = null;

export const initDatabase = async () => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            db = await SQLite.openDatabaseAsync('hazardeye.db');


            await db.execAsync(`PRAGMA journal_mode = WAL;`);

            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS incidents (
                    id TEXT PRIMARY KEY NOT NULL,
                    server_id INTEGER,
                    created_at TEXT NOT NULL,
                    media_uris TEXT,
                    severity INTEGER,
                    sync_status TEXT DEFAULT 'pending',
                    status TEXT DEFAULT 'open',
                    note TEXT,
                    department TEXT,
                    area TEXT,
                    plant TEXT
                );`);

            await db.execAsync(`
                     CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY NOT NULL,
                    server_id INTEGER,
                    title TEXT,
                    assignee TEXT,
                    description TEXT,
                    priority TEXT,
                    status TEXT,
                    due_date TEXT,
                    comments TEXT,
                    area TEXT,
                    plant TEXT,
                    precautions TEXT,
                    incident_id TEXT,
                    delay_reason TEXT,
                    delayed_at TEXT,
                    delay_history TEXT,
                    sync_status TEXT DEFAULT 'pending'
                );`);

            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS devices (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT,
                    
                    station TEXT,
                    last_sync TEXT,
                    battery_level INTEGER,
                    storage_used TEXT
                    
                );
            `);

            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS locations (
                    id INTEGER PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    latitude REAL,
                    longitude REAL,
                    type TEXT,
                    parent_id INTEGER,
                    parent_name TEXT
                );
            `);

            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY NOT NULL,
                    employee_id TEXT,
                    name TEXT NOT NULL,
                    email TEXT,
                    role TEXT,
                    department TEXT
                );
            `);

            // Migrations
            const migrations = [
                'ALTER TABLE incidents ADD COLUMN status TEXT DEFAULT "open"',
                'ALTER TABLE incidents ADD COLUMN note TEXT',
                'ALTER TABLE incidents ADD COLUMN department TEXT',
                'ALTER TABLE incidents ADD COLUMN area TEXT',
                'ALTER TABLE incidents ADD COLUMN plant TEXT',
                'ALTER TABLE incidents ADD COLUMN server_id INTEGER', // New migration
                'ALTER TABLE tasks ADD COLUMN delay_reason TEXT',
                'ALTER TABLE tasks ADD COLUMN incident_id TEXT',
                'ALTER TABLE tasks ADD COLUMN title TEXT',
                'ALTER TABLE tasks ADD COLUMN precautions TEXT',
                'ALTER TABLE tasks ADD COLUMN sync_status TEXT DEFAULT "pending"',
                'ALTER TABLE tasks ADD COLUMN server_id INTEGER', // New migration
                'ALTER TABLE tasks ADD COLUMN delayed_at TEXT',
                'ALTER TABLE tasks ADD COLUMN delay_history TEXT',
                'CREATE TABLE IF NOT EXISTS devices (id TEXT PRIMARY KEY NOT NULL, name TEXT, model TEXT, station TEXT, last_sync TEXT, battery_level INTEGER, storage_used TEXT, model_version TEXT, model_updated TEXT)'
            ];

            for (const sql of migrations) {
                try {
                    await db.execAsync(sql);
                } catch (e) {
                    // Ignore duplicate column errors
                }
            }

            console.log('Database initialized successfully');

            // ... device seeding
            // ... device seeding
            const deviceCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM devices');
            if (deviceCount?.count === 0) {
                await db.runAsync(
                    'INSERT INTO devices (id, name, model, station, last_sync, battery_level, storage_used, model_version, model_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    ['HAZ-EYE-102', 'Mobile Terminal Alpha', 'Rugged Tab v4', 'Main Refinery - Gate 2', new Date().toISOString(), 85, '1.2 GB / 64 GB', '1.0.4', '2025-12-30']
                );
            }
        } catch (error) {
            console.error('Error initializing database:', error);
            initPromise = null;
            throw error;
        }
    })();

    return initPromise;
};

// --- INCIDENTS ---

export const saveIncident = async (incident: Incident) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync(
            'INSERT INTO incidents (id, created_at, media_uris, severity, sync_status, status, note, department, area, plant) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?,?)',
            [
                incident.id || '',
                incident.created_at || new Date().toISOString(),
                incident.media_uris || '[]',

                incident.severity || 1,
                incident.sync_status || 'pending',
                incident.status || 'open',
                incident.note || '',
                incident.department || '',
                incident.area || '',
                incident.plant || ''
            ]
        );
    } catch (error) {
        console.error('Error saving incident:', error);
        throw error;
    }
};

export const updateIncident = async (incident: Incident) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync(
            'UPDATE incidents SET  severity = ?, note = ?, sync_status = ? WHERE id = ?',
            [

                incident.severity || 1,
                incident.note || '',
                'pending',
                incident.id || ''
            ]
        );
    } catch (error) {
        console.error('Error updating incident:', error);
        throw error;
    }
};

export const getIncidentById = async (id: string): Promise<Incident | null> => {
    try {
        if (!db) await initDatabase();
        return await db.getFirstAsync<Incident>('SELECT * FROM incidents WHERE id = ?', [id || '']);
    } catch (error) {
        return null;
    }
};

export const getAllIncidents = async (): Promise<Incident[]> => {
    try {
        if (!db) await initDatabase();
        return await db.getAllAsync<Incident>('SELECT * FROM incidents ORDER BY created_at DESC');
    } catch (error) {
        return [];
    }
};

export const getPendingIncidents = async (): Promise<Incident[]> => {
    try {
        if (!db) await initDatabase();
        return await db.getAllAsync<Incident>("SELECT * FROM incidents WHERE sync_status = 'pending'");
    } catch (error) {
        return [];
    }
};

export const updateIncidentStatus = async (id: string, status: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('UPDATE incidents SET status = ? WHERE id = ?', [status || 'open', id || '']);
    } catch (error) { }
};

export const markIncidentUploaded = async (id: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync("UPDATE incidents SET sync_status = 'synced' WHERE id = ?", [id || '']);
    } catch (error) { }
};

export const deleteIncident = async (id: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('DELETE FROM incidents WHERE id = ?', [id || '']);
    } catch (error) { }
};

// --- TASKS ---

export const getTasks = async (): Promise<Task[]> => {
    try {
        if (!db) await initDatabase();
        return await db.getAllAsync<Task>('SELECT * FROM tasks');
    } catch (error) {
        return [];
    }
};

export const createTask = async (task: Task) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync(
            'INSERT INTO tasks (id, title, assignee, description, priority, status, due_date, comments, area, plant, precautions, incident_id, sync_status, delayed_at, delay_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [task.id || '', task.title || '', task.assignee || '', task.description || '', task.priority || 'medium', task.status || 'pending', task.due_date || '', task.comments || '[]', task.area || '', task.plant || '', task.precautions || '', task.incident_id || '', task.sync_status || 'pending', task.delayed_at || '', task.delay_history || '[]']
        );
    } catch (error) {
        console.error('Error creating task:', error);
    }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
    try {
        if (!db) await initDatabase();
        return await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [id || '']);
    } catch (error) {
        return null;
    }
};

export const updateTaskStatus = async (id: string, status: string, delayReason?: string, delayedAt?: string) => {
    try {
        if (!db) await initDatabase();
        if (delayReason) {
            // Fetch existing history to append
            const task = await db.getFirstAsync<Task>('SELECT delay_history FROM tasks WHERE id = ?', [id]);
            let history: { reason: string; timestamp: string }[] = [];
            try {
                if (task?.delay_history) {
                    history = JSON.parse(task.delay_history);
                }
            } catch (e) {
                // Ignore parse error, start fresh
            }

            const newEntry = {
                reason: delayReason,
                timestamp: delayedAt || new Date().toISOString()
            };
            // Add to history (newest first or last? Let's do newest first for display convenience, but array usually append. Let's append.)
            // Actually, for display "history", newest first is often better. But standard arrays append. I'll unshift.
            history.unshift(newEntry);

            await db.runAsync('UPDATE tasks SET status = ?, delay_reason = ?, delayed_at = ?, delay_history = ?, sync_status = "pending" WHERE id = ?',
                [status || 'Delayed', delayReason || '', delayedAt || new Date().toISOString(), JSON.stringify(history), id || '']);
        } else {
            await db.runAsync('UPDATE tasks SET status = ?, sync_status = "pending" WHERE id = ?', [status || '', id || '']);
        }
    } catch (error) { }
};

export const updateTaskDetails = async (id: string, updates: Partial<Task>) => {
    try {
        if (!db) await initDatabase();
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await db.runAsync(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id || '']);
    } catch (error) { }
};

export const deleteTask = async (id: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('DELETE FROM tasks WHERE id = ?', [id || '']);
    } catch (error) { }
};

export const getPendingTasks = async (): Promise<Task[]> => {
    try {
        if (!db) await initDatabase();
        return await db.getAllAsync<Task>("SELECT * FROM tasks WHERE sync_status = 'pending'");
    } catch (error) {
        return [];
    }
};

export const markTaskUploaded = async (id: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('UPDATE tasks SET sync_status = "synced" WHERE id = ?', [id || '']);
    } catch (error) { }
};

export interface TaskComment {
    text: string;
    timestamp: string;
}

export const addTaskComment = async (id: string, comment: string) => {
    try {
        if (!db) await initDatabase();
        const task = await db.getFirstAsync<Task>('SELECT comments FROM tasks WHERE id = ?', [id || '']);
        if (task) {
            const comments = JSON.parse(task.comments || '[]');
            const newComment: TaskComment = {
                text: comment,
                timestamp: new Date().toISOString()
            };
            comments.push(newComment);
            await db.runAsync('UPDATE tasks SET comments = ?, sync_status = "pending" WHERE id = ?', [JSON.stringify(comments), id || '']);
        }
    } catch (error) { }
};

export const reportTaskDelay = async (id: string, reason: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('UPDATE tasks SET delay_reason = ?, sync_status = "pending" WHERE id = ?', [reason || '', id || '']);
    } catch (error) { }
};

// --- DEVICES ---

export const getDeviceData = async (): Promise<Device | null> => {
    try {
        if (!db) await initDatabase();
        return await db.getFirstAsync<Device>('SELECT * FROM devices LIMIT 1');
    } catch (error) {
        return null;
    }
};


export const updateDeviceSyncTime = async (id: string) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('UPDATE devices SET last_sync = ? WHERE id = ?', [new Date().toISOString(), id]);
    } catch (error) { }
};

export const updateIncidentServerId = async (id: string, serverId: number) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('UPDATE incidents SET server_id = ?, sync_status = "synced" WHERE id = ?', [serverId, id]);
    } catch (error) { }
};

export const updateTaskServerId = async (id: string, serverId: number) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('UPDATE tasks SET server_id = ?, sync_status = "synced" WHERE id = ?', [serverId, id]);
    } catch (error) { }
};

// --- LOCATIONS ---

export const saveLocations = async (locations: Location[]) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('DELETE FROM locations'); // Refresh all
        for (const loc of locations) {
            await db.runAsync(
                'INSERT INTO locations (id, name, description, latitude, longitude, type, parent_id, parent_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [loc.id, loc.name, loc.description || '', loc.latitude || 0, loc.longitude || 0, loc.type || '', loc.parent_id || null, loc.parent_name || '']
            );
        }
    } catch (error) {
        console.error('Error saving locations:', error);
    }
};

export const getLocations = async (): Promise<Location[]> => {
    try {
        if (!db) await initDatabase();
        return await db.getAllAsync<Location>('SELECT * FROM locations ORDER BY name ASC');
    } catch (error) {
        return [];
    }
};

export const clearLocations = async () => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('DELETE FROM locations');
    } catch (error) { }
};

// --- USERS ---

export const saveUsers = async (users: MobileUser[]) => {
    try {
        if (!db) await initDatabase();
        await db.runAsync('DELETE FROM users');
        for (const user of users) {
            await db.runAsync(
                'INSERT INTO users (id, employee_id, name, email, role, department) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, user.employee_id || '', user.name, user.email, user.role, user.department || '']
            );
        }
    } catch (error) { }
};

export const getUsers = async (): Promise<MobileUser[]> => {
    try {
        if (!db) await initDatabase();
        return await db.getAllAsync<MobileUser>('SELECT * FROM users ORDER BY name ASC');
    } catch (error) {
        return [];
    }
};
