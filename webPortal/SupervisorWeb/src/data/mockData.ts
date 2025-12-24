import {
  Incident,
  Task,
  User,
  Severity,
  Priority,
  Department,
  IncidentStatus,
  TaskStatus,
  AIRecommendation,
  SafetyResource,
  TrainingMaterial,
  Alert,
  EmergencyInstruction
} from '../types';

export const AREA_OPTIONS = ['Plant A', 'Plant B', 'Plant C', 'Warehouse', 'Office Building'];
export const PLANT_OPTIONS = ['Main Facility', 'North Wing', 'South Wing', 'Annex Building'];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Supervisor',
    email: 'john.supervisor@hazardeeye.com',
    role: 'supervisor',
    department: 'Fire & Safety',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: '2',
    name: 'Sarah Employee',
    email: 'sarah.employee@hazardeeye.com',
    role: 'employee',
    department: 'Electrical',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: '3',
    name: 'Mike Technician',
    email: 'mike.tech@hazardeeye.com',
    role: 'employee',
    department: 'Mechanical',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    id: '4',
    name: 'Emma Engineer',
    email: 'emma.eng@hazardeeye.com',
    role: 'employee',
    department: 'Civil',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  },
];

// Mock AI Recommendations
const mockAIRecommendations: AIRecommendation[] = [
  {
    whatToDo: 'Immediately isolate the affected electrical panel and de-energize the circuit. Contact the electrical maintenance team for inspection and repair.',
    whyItMatters: 'Exposed wiring poses a severe electrocution risk and fire hazard. Immediate action prevents potential injuries and equipment damage.',
    preventiveSteps: [
      'Conduct monthly visual inspections of all electrical panels',
      'Install protective covers on all exposed wiring',
      'Implement lockout/tagout procedures for maintenance',
      'Schedule quarterly electrical safety audits',
    ],
    riskExplanation: 'The exposed wiring creates multiple hazards: direct contact can cause severe electrical shock or electrocution, and arcing can ignite nearby combustible materials. The risk is compounded by the industrial environment where workers may be in close proximity.',
  },
  {
    whatToDo: 'Cordon off the area immediately and assess structural integrity. Engage structural engineering team for detailed inspection and reinforcement plan.',
    whyItMatters: 'Structural damage can lead to catastrophic failure, endangering personnel and causing significant operational downtime.',
    preventiveSteps: [
      'Implement regular structural integrity assessments',
      'Monitor for signs of stress or degradation',
      'Maintain proper load distribution protocols',
      'Schedule annual structural engineering reviews',
    ],
    riskExplanation: 'Cracks in structural elements indicate potential failure points. Without intervention, this could lead to partial or complete structural collapse, resulting in serious injuries, fatalities, and extensive property damage.',
  },
  {
    whatToDo: 'Evacuate the immediate area and activate fire suppression systems. Contact fire safety team and emergency services if necessary.',
    whyItMatters: 'Fire hazards in industrial settings can escalate rapidly, causing extensive damage and posing life-threatening risks to all personnel.',
    preventiveSteps: [
      'Ensure all fire suppression equipment is regularly inspected',
      'Maintain clear evacuation routes',
      'Conduct monthly fire safety drills',
      'Implement strict no-smoking policies in designated areas',
    ],
    riskExplanation: 'Industrial fires can spread quickly due to the presence of flammable materials and complex ventilation systems. Early detection and response are critical to preventing catastrophic outcomes.',
  },
];

// Generate mock incidents
export const generateMockIncidents = (count: number = 25): Incident[] => {
  const areas = AREA_OPTIONS;
  const plants = PLANT_OPTIONS;
  const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', undefined];
  const departments: Department[] = [
    'Electrical',
    'Mechanical',
    'Civil',
    'Fire & Safety',
    'Environmental',
    'General',
  ];
  const severities: Severity[] = ['High', 'Medium', 'Low'];
  const statuses: IncidentStatus[] = ['Open', 'In Progress', 'Resolved'];

  const descriptions = [
    'Exposed electrical wiring found near main control panel. Immediate attention required.',
    'Structural crack observed in support beam. Engineering assessment needed.',
    'Fire extinguisher missing from designated location. Safety compliance issue.',
    'Chemical spill detected in storage area. Containment and cleanup required.',
    'Damaged safety railing on second floor walkway. Fall hazard identified.',
    'Malfunctioning emergency exit lighting. Evacuation safety concern.',
    'Leaking pipe in mechanical room. Water damage and slip hazard.',
    'Overloaded electrical circuit causing intermittent power issues.',
    'Damaged floor grating creating trip hazard in production area.',
    'Inadequate ventilation in confined space. Air quality concern.',
  ];

  const incidents: Incident[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const dateTime = new Date(now);
    dateTime.setDate(dateTime.getDate() - daysAgo);
    dateTime.setHours(dateTime.getHours() - hoursAgo);

    const department = departments[Math.floor(Math.random() * departments.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    incidents.push({
      id: `incident-${i + 1}`,
      imageUrl: `https://picsum.photos/seed/incident-${i + 1}/800/600`,
      dateTime,
      area: areas[Math.floor(Math.random() * areas.length)],
      plant: plants[Math.floor(Math.random() * plants.length)],
      unit: units[Math.floor(Math.random() * units.length)],
      department,
      severity,
      status,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      aiSummary: `AI analysis indicates ${severity.toLowerCase()} severity ${department.toLowerCase()} issue requiring ${status === 'Open' ? 'immediate' : status === 'In Progress' ? 'ongoing' : 'completed'} attention.`,
      aiRecommendation: mockAIRecommendations[Math.floor(Math.random() * mockAIRecommendations.length)],
    });
  }

  return incidents.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
};

// Generate mock tasks
export const generateMockTasks = (incidents: Incident[], users: User[]): Task[] => {
  const tasks: Task[] = [];
  const employeeUsers = users.filter(u => u.role === 'employee');
  const supervisorUsers = users.filter(u => u.role === 'supervisor');

  if (employeeUsers.length === 0 || supervisorUsers.length === 0) return tasks;

  const priorities: Priority[] = ['High', 'Medium', 'Low'];
  const statuses: TaskStatus[] = ['Open', 'In Progress', 'Completed', 'Delayed'];
  const delayReasons = [
    'Waiting for parts delivery',
    'Requires additional resources',
    'Weather conditions',
    'Pending approval',
    'Equipment unavailable',
  ];

  // Create tasks from some incidents
  incidents.slice(0, 15).forEach((incident, index) => {
    const assignedEmployee = employeeUsers[Math.floor(Math.random() * employeeUsers.length)];
    const supervisor = supervisorUsers[0];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const dueDate = new Date(incident.dateTime);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) + 1);

    const task: Task = {
      id: `task-${index + 1}`,
      incidentId: incident.id,
      description: `Address ${incident.department} issue: ${incident.description}`,
      area: incident.area,
      plant: incident.plant,
      dueDate,
      priority,
      status,
      precautions: incident.aiRecommendation?.preventiveSteps.join('; ') || 'Follow standard safety protocols.',
      assignedTo: assignedEmployee.id,
      assignedToName: assignedEmployee.name,
      createdBy: supervisor.id,
      createdByName: supervisor.name,
      createdAt: new Date(incident.dateTime.getTime() + 3600000), // 1 hour after incident
      comments: [],
    };

    if (status === 'Delayed') {
      const reason = delayReasons[Math.floor(Math.random() * delayReasons.length)];
      // Delay recorded a bit before the due date for realistic timelines
      const delayDate = new Date(dueDate);
      delayDate.setDate(delayDate.getDate() - Math.floor(Math.random() * 3) - 1);

      task.delayReason = reason;
      task.delayDate = delayDate;
      task.delayHistory = [
        {
          reason,
          date: delayDate,
        },
      ];
    }

    // Add some comments
    if (Math.random() > 0.5) {
      task.comments.push({
        id: `comment-${index}-1`,
        taskId: task.id,
        userId: assignedEmployee.id,
        userName: assignedEmployee.name,
        userRole: 'employee',
        content: 'Started working on this task. Initial assessment complete.',
        timestamp: new Date(task.createdAt.getTime() + 86400000),
      });
    }

    if (status === 'Delayed' && task.delayReason) {
      task.comments.push({
        id: `comment-${index}-2`,
        taskId: task.id,
        userId: assignedEmployee.id,
        userName: assignedEmployee.name,
        userRole: 'employee',
        content: `Task delayed: ${task.delayReason}`,
        timestamp: new Date(task.dueDate.getTime() - 86400000),
      });
    }

    tasks.push(task);
  });

  // Additional mock tasks specifically to populate the Employee view
  if (supervisorUsers.length > 0) {
    const employeePersona = supervisorUsers[0];
    const now = new Date();

    const extraTasks: Task[] = [
      {
        id: 'emp-task-1',
        incidentId: undefined,
        description: 'Inspect safety railing near loading dock platform.',
        area: 'Loading Dock',
        plant: 'Main Facility',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'Medium',
        status: 'Open',
        precautions: 'Ensure area is cordoned off during inspection. Wear fall protection harness.',
        assignedTo: employeePersona.id,
        assignedToName: employeePersona.name,
        createdBy: employeePersona.id,
        createdByName: employeePersona.name,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        comments: [],
      },
      {
        id: 'emp-task-2',
        incidentId: undefined,
        description: 'Verify emergency exit lighting in south wing corridor.',
        area: 'Plant B',
        plant: 'South Wing',
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        priority: 'Low',
        status: 'Completed',
        precautions: 'Perform test during low-traffic hours. Keep corridor clear of obstructions.',
        assignedTo: employeePersona.id,
        assignedToName: employeePersona.name,
        createdBy: employeePersona.id,
        createdByName: employeePersona.name,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        comments: [
          {
            id: 'emp-task-2-comment-1',
            taskId: 'emp-task-2',
            userId: employeePersona.id,
            userName: employeePersona.name,
            userRole: 'employee',
            content: 'All emergency lights tested and functioning as expected.',
            timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        id: 'emp-task-3',
        incidentId: undefined,
        description: 'Replace corroded valve on fire water line in Refinery A.',
        area: 'Refinery A',
        plant: 'Main Facility',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
        priority: 'High',
        status: 'Delayed',
        precautions:
          'Isolate line and follow lockout/tagout procedures. Confirm zero pressure before starting work.',
        assignedTo: employeePersona.id,
        assignedToName: employeePersona.name,
        createdBy: employeePersona.id,
        createdByName: employeePersona.name,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        delayReason: 'Awaiting delivery of certified replacement valve.',
        delayDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        delayHistory: [
          {
            reason: 'Awaiting delivery of certified replacement valve.',
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
        comments: [
          {
            id: 'emp-task-3-comment-1',
            taskId: 'emp-task-3',
            userId: employeePersona.id,
            userName: employeePersona.name,
            userRole: 'employee',
            content: 'Work area prepared, pending arrival of spare valve.',
            timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    ];

    tasks.push(...extraTasks);
  }

  return tasks;
};

// Mock Safety Resources
export const mockSafetyResources: SafetyResource[] = [
  {
    id: 'sr-1',
    title: 'General Workplace Safety',
    type: 'Safety Guideline',
    lastUpdated: new Date('2024-12-15'),
    markdownFile: 'general-workplace-safety.md'
  },
  {
    id: 'sr-2',
    title: 'Lockout/Tagout Procedure (LOTO)',
    type: 'SOP',
    lastUpdated: new Date('2024-11-20'),
    markdownFile: 'loto-procedure.md'
  }
];


// Mock Training Materials
export const mockTrainingMaterials: TrainingMaterial[] = [
  {
    id: 'tm-1',
    title: 'Chemical Safety Awareness',
    description: 'A comprehensive guide to handling hazardous chemicals in the workplace.',
    uploadedDate: new Date('2024-10-05'),
    downloadUrl: '#',
    thumbnail: 'https://picsum.photos/seed/training-1/400/225'
  },
  {
    id: 'tm-2',
    title: 'Fire Extinguisher Training',
    description: 'Interactive course on how to properly use different types of fire extinguishers.',
    uploadedDate: new Date('2024-09-12'),
    downloadUrl: '#',
    thumbnail: 'https://picsum.photos/seed/training-2/400/225'
  },
  {
    id: 'tm-3',
    title: 'First Aid & CPR Basics',
    description: 'Essential first aid skills and CPR certification documentation.',
    uploadedDate: new Date('2024-08-20'),
    downloadUrl: '#',
    thumbnail: 'https://picsum.photos/seed/training-3/400/225'
  }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'Severe Weather Warning',
    message: 'High winds expected in Plant A area. Secure all loose equipment and avoid elevated platforms.',
    timestamp: new Date(),
    severity: 'High'
  },
  {
    id: 'alert-2',
    title: 'Scheduled Power Outage',
    message: 'Brief power interruption scheduled for Plant B Unit 2 at 14:00 for maintenance.',
    timestamp: new Date(),
    severity: 'Medium'
  }
];

// Mock Emergency Instructions
export const mockEmergencyInstructions: EmergencyInstruction[] = [
  {
    id: 'ei-1',
    title: 'Fire Evacuation',
    description: 'Steps to take in case of a fire emergency.',
    steps: [
      'Rescue: Assist anyone in immediate danger if safe to do so.',
      'Alarm: Activate the nearest fire alarm station.',
      'Contain: Close doors and windows to contain the fire.',
      'Evacuate: Leave the building via the nearest safe exit.'
    ]
  },
  {
    id: 'ei-2',
    title: 'Chemical Spill Response',
    description: 'Protocol for managing hazardous material leaks.',
    steps: [
      'Evacuate the immediate area.',
      'Notify the safety officer and hazmat team.',
      'Identify the spilled substance if safe to do so.',
      'Assist in cordoning off the area.'
    ]
  }
];

