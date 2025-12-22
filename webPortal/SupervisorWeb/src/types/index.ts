export type UserRole = 'supervisor' | 'employee';

export type Severity = 'High' | 'Medium' | 'Low';

export type Priority = 'High' | 'Medium' | 'Low';

export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved';

export type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Delayed';

export type Department =
  | 'Electrical'
  | 'Mechanical'
  | 'Civil'
  | 'Fire & Safety'
  | 'Environmental'
  | 'General';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department;
  avatar?: string;
}

export interface Incident {
  id: string;
  imageUrl: string;
  dateTime: Date;
  area: string;
  plant: string;
  unit?: string;
  department: Department;
  severity: Severity;
  status: IncidentStatus;
  description: string;
  aiSummary?: string;
  aiRecommendation?: AIRecommendation;
}

export interface AIRecommendation {
  whatToDo: string;
  whyItMatters: string;
  preventiveSteps: string[];
  riskExplanation: string;
}

export interface TaskDelayEntry {
  reason: string;
  date: Date;
}

export interface Task {
  id: string;
  incidentId?: string;
  description: string;
  area: string;
  plant: string;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
  precautions: string;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  delayReason?: string;
  delayDate?: Date;
  delayHistory?: TaskDelayEntry[];
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: Date;
}

export interface FilterState {
  timeRange: 'Today' | 'Weekly' | 'Monthly' | 'Custom' | 'All';
  customStartDate?: Date;
  customEndDate?: Date;
  areas: string[];
  severities: Severity[];
  departments: Department[];
  statuses: IncidentStatus[];
}

export interface SafetyResource {
  id: string;
  title: string;
  type: 'Safety Guideline' | 'SOP';
  lastUpdated: Date;
  content: string;
  sections: { title: string; items: string[]; icon?: string }[];
}

export interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  uploadedDate: Date;
  downloadUrl?: string;
  thumbnail?: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  severity: 'High' | 'Medium';
}

export interface EmergencyInstruction {
  id: string;
  title: string;
  description: string;
  steps: string[];
}

export interface AppState {
  currentUser: User;
  incidents: Incident[];
  tasks: Task[];
  users: User[];
  filters: FilterState;
  safetyResources: SafetyResource[];
  trainingMaterials: TrainingMaterial[];
  alerts: Alert[];
  emergencyInstructions: EmergencyInstruction[];
}

