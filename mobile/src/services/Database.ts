import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabaseSync('hazard_eye.db');

export interface Incident {
  id: string;
  created_at: string;
  media_uris: string; // JSON string
  ml_metadata: string; // JSON string
  advisory: string;
  severity: number;
  sync_status: 'pending' | 'uploaded' | 'failed';
  note: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  due_date: string;
  description: string;
  comments: string; // JSON string of string[]
  delay_reason?: string;
}

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      media_uris TEXT NOT NULL,
      ml_metadata TEXT NOT NULL,
      advisory TEXT,
      severity REAL,
      sync_status TEXT DEFAULT 'pending',
      note TEXT
    );
  `);

  // Re-create tasks table with new schema
  db.execSync('DROP TABLE IF EXISTS tasks');
  db.execSync(`
     CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignee TEXT NOT NULL,
      due_date TEXT,
      description TEXT,
      comments TEXT DEFAULT '[]',
      delay_reason TEXT
    );
  `);

  seedTasks();
};

const seedTasks = () => {
  const count = db.getAllSync('SELECT count(*) as count FROM tasks') as { count: number }[];
  if (count[0].count === 0) {
    const tasks: Task[] = [
      {
        id: 'T-101',
        title: 'Safety Valve Inspection - Unit B-5',
        status: 'pending',
        priority: 'high',
        assignee: 'Safety Officer Ritesh ',
        due_date: '2025-12-05',
        description: 'Inspect all safety valves in Unit B-5 and document any issues',
        comments: '[]'
      },
      {
        id: 'T-102',
        title: 'Fire Extinguisher Monthly Check',
        status: 'in_progress',
        priority: 'medium',
        assignee: 'Safety Officer Shourya ',
        due_date: '2025-12-03',
        description: 'Check all fire extinguishers in Zone 3',
        comments: '[]'
      },
      {
        id: 'T-103',
        title: 'PPE Compliance Audit',
        status: 'pending',
        priority: 'high',
        assignee: 'Safety Officer Divyansh',
        due_date: '2025-12-10',
        description: 'Conduct PPE compliance check in processing area',
        comments: '[]'
      },
      {
        id: 'T-104',
        title: 'Emergency Exit Clearance',
        status: 'completed',
        priority: 'medium',
        assignee: 'Safety Officer Davendra',
        due_date: '2025-12-01',
        description: 'Ensure all emergency exits are clear and accessible',
        comments: '[]'
      },
      {
        id: 'T-105',
        title: 'Future Compliance Review',
        status: 'pending',
        priority: 'low',
        assignee: 'Safety Officer Tarun',
        due_date: '2026-01-01',
        description: 'Annual review of safety protocols for the next year.',
        comments: '[]'
      }
    ];

    for (const task of tasks) {
      db.runSync(
        'INSERT INTO tasks (id, title, status, priority, assignee, due_date, description, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [task.id, task.title, task.status, task.priority, task.assignee, task.due_date, task.description, task.comments]
      );
    }
  }
};

export const saveIncident = (incident: Incident) => {
  db.runSync(
    'INSERT INTO incidents (id, created_at, media_uris, ml_metadata, advisory, severity, sync_status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [incident.id, incident.created_at, incident.media_uris, incident.ml_metadata, incident.advisory, incident.severity, incident.sync_status, incident.note]
  );
};

export const getPendingIncidents = (): Incident[] => {
  return db.getAllSync('SELECT * FROM incidents WHERE sync_status = ?', ['pending']) as Incident[];
};

export const getAllIncidents = (): Incident[] => {
  return db.getAllSync('SELECT * FROM incidents ORDER BY created_at DESC') as Incident[];
};

export const markIncidentUploaded = (id: string) => {
  db.runSync('UPDATE incidents SET sync_status = ? WHERE id = ?', ['uploaded', id]);
};

export const getIncidentById = (id: string): Incident | null => {
  const result = db.getAllSync('SELECT * FROM incidents WHERE id = ?', [id]) as Incident[];
  return result.length > 0 ? result[0] : null;
};

export const updateIncident = (incident: Incident) => {
  db.runSync(
    'UPDATE incidents SET advisory = ?, severity = ?, note = ? WHERE id = ?',
    [incident.advisory, incident.severity, incident.note, incident.id]
  );
};

export const deleteIncident = (id: string) => {
  db.runSync('DELETE FROM incidents WHERE id = ?', [id]);
};

export const getTasks = (): Task[] => {
  return db.getAllSync('SELECT * FROM tasks') as Task[];
};

export const updateTaskStatus = (id: string, status: string) => {
  db.runSync('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
};

export const addTaskComment = (id: string, comment: string) => {
  // Read existing
  const task = db.getAllSync('SELECT comments FROM tasks WHERE id = ?', [id]) as { comments: string }[];
  if (task.length > 0) {
    const comments = JSON.parse(task[0].comments || '[]');
    comments.push(comment);
    db.runSync('UPDATE tasks SET comments = ? WHERE id = ?', [JSON.stringify(comments), id]);
  }
};

export const reportTaskDelay = (id: string, reason: string) => {
  db.runSync('UPDATE tasks SET delay_reason = ? WHERE id = ?', [reason, id]);
};
