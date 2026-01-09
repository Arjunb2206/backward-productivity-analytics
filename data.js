// Enums
const Role = {
  ADMIN: 'Admin',
  MANAGER: 'Department Manager',
  VIEWER: 'Viewer'
};

const TaskStatus = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue'
};

const DelayReasonCategory = {
  NONE: 'None',
  APPROVAL: 'Approval Delay',
  RESOURCE: 'Resource Unavailable',
  TECHNICAL: 'Technical Difficulty',
  SCOPE: 'Scope Change',
  DEPENDENCY: 'Dependency Failure',
  EXTERNAL: 'External Vendor Delay',
  COMMUNICATION: 'Communication Gap'
};

// Enhanced Mock Data with More Projects
const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'Q3 Enterprise Cloud Migration',
    description: 'Decommissioning legacy physical servers and migrating core databases to high-availability cloud instances.',
    plannedStartDate: '2024-06-01',
    plannedEndDate: '2024-08-30',
    actualEndDate: '2024-09-18',
    status: 'Delayed',
    department: 'IT Operations',
    budget: 250000,
    priority: 'High'
  },
  {
    id: 'p2',
    name: 'Annual Security Compliance Audit',
    description: 'Mandatory SOC2 Type II audit and internal security hardening across all departments.',
    plannedStartDate: '2024-07-01',
    plannedEndDate: '2024-10-15',
    actualEndDate: '2024-10-12',
    status: 'Completed',
    department: 'Security',
    budget: 120000,
    priority: 'Critical'
  },
  {
    id: 'p3',
    name: 'AI Model Integration',
    description: 'Integrating new LLM capabilities into the primary customer support platform.',
    plannedStartDate: '2024-09-15',
    plannedEndDate: '2024-12-20',
    status: 'Active',
    department: 'Engineering',
    budget: 180000,
    priority: 'High'
  },
  {
    id: 'p4',
    name: 'Mobile App Redesign',
    description: 'Complete UI/UX overhaul of the mobile application with new design system and improved performance.',
    plannedStartDate: '2024-08-01',
    plannedEndDate: '2024-11-30',
    actualEndDate: '2024-12-15',
    status: 'Delayed',
    department: 'Product Design',
    budget: 95000,
    priority: 'Medium'
  },
  {
    id: 'p5',
    name: 'Data Warehouse Optimization',
    description: 'Restructuring data warehouse architecture for improved query performance and cost reduction.',
    plannedStartDate: '2024-07-15',
    plannedEndDate: '2024-10-01',
    actualEndDate: '2024-09-28',
    status: 'Completed',
    department: 'Data Engineering',
    budget: 140000,
    priority: 'High'
  },
  {
    id: 'p6',
    name: 'Customer Portal Enhancement',
    description: 'Adding self-service features and improving customer dashboard with real-time analytics.',
    plannedStartDate: '2024-10-01',
    plannedEndDate: '2025-01-15',
    status: 'Active',
    department: 'Product',
    budget: 110000,
    priority: 'Medium'
  },
  {
    id: 'p7',
    name: 'Marketing Automation Platform',
    description: 'Implementing comprehensive marketing automation system with email campaigns and lead scoring.',
    plannedStartDate: '2024-09-01',
    plannedEndDate: '2024-12-31',
    status: 'Active',
    department: 'Marketing',
    budget: 85000,
    priority: 'Medium'
  },
  {
    id: 'p8',
    name: 'API Gateway Modernization',
    description: 'Replacing legacy API gateway with modern microservices architecture and improved security.',
    plannedStartDate: '2024-06-15',
    plannedEndDate: '2024-09-30',
    actualEndDate: '2024-10-20',
    status: 'Delayed',
    department: 'Platform Engineering',
    budget: 200000,
    priority: 'Critical'
  }
];

const MOCK_TASKS = [
  // Project 1 Tasks (Cloud Migration - Delayed)
  {
    id: 't1',
    projectId: 'p1',
    name: 'Legacy Audit & Inventory',
    assignedDept: 'IT Operations',
    plannedEndDate: '2024-06-15',
    actualEndDate: '2024-06-28',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.RESOURCE,
    delayReasonNote: 'Three senior engineers were pulled into a P0 emergency, leaving only juniors to finish the audit.'
  },
  {
    id: 't2',
    projectId: 'p1',
    name: 'Database Schema Sync',
    assignedDept: 'Data Engineering',
    plannedEndDate: '2024-07-15',
    actualEndDate: '2024-07-30',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.DEPENDENCY,
    delayReasonNote: 'Blocked by delayed Legacy Audit completion.'
  },
  {
    id: 't3',
    projectId: 'p1',
    name: 'Application Containerization',
    assignedDept: 'DevOps',
    plannedEndDate: '2024-08-15',
    actualEndDate: '2024-09-05',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.TECHNICAL,
    delayReasonNote: 'Encountered architectural debt in legacy code that prevented standard Dockerization.'
  },
  {
    id: 't4',
    projectId: 'p1',
    name: 'Final Production Deployment',
    assignedDept: 'Engineering',
    plannedEndDate: '2024-08-30',
    actualEndDate: '2024-09-18',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.DEPENDENCY,
    delayReasonNote: 'Deployment sequence delayed by containerization issues.'
  },

  // Project 2 Tasks (Security Audit - Completed)
  {
    id: 't5',
    projectId: 'p2',
    name: 'Access Control Review',
    assignedDept: 'Security',
    plannedEndDate: '2024-08-01',
    actualEndDate: '2024-07-28',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't6',
    projectId: 'p2',
    name: 'External Audit Phase',
    assignedDept: 'Compliance',
    plannedEndDate: '2024-09-15',
    actualEndDate: '2024-09-14',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't7',
    projectId: 'p2',
    name: 'Remediation Fixes',
    assignedDept: 'Engineering',
    plannedEndDate: '2024-10-15',
    actualEndDate: '2024-10-12',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },

  // Project 3 Tasks (AI Integration - Active)
  {
    id: 't8',
    projectId: 'p3',
    name: 'Prompt Engineering Strategy',
    assignedDept: 'Product',
    plannedEndDate: '2024-10-01',
    actualEndDate: '2024-10-05',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't9',
    projectId: 'p3',
    name: 'API Gateway Implementation',
    assignedDept: 'Engineering',
    plannedEndDate: '2024-11-15',
    status: TaskStatus.IN_PROGRESS
  },
  {
    id: 't10',
    projectId: 'p3',
    name: 'Model Fine-tuning',
    assignedDept: 'ML Engineering',
    plannedEndDate: '2024-12-01',
    status: TaskStatus.PENDING
  },

  // Project 4 Tasks (Mobile Redesign - Delayed)
  {
    id: 't11',
    projectId: 'p4',
    name: 'User Research & Analysis',
    assignedDept: 'UX Research',
    plannedEndDate: '2024-08-20',
    actualEndDate: '2024-09-05',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.APPROVAL,
    delayReasonNote: 'Stakeholder feedback rounds took longer than expected.'
  },
  {
    id: 't12',
    projectId: 'p4',
    name: 'Design System Creation',
    assignedDept: 'Product Design',
    plannedEndDate: '2024-09-30',
    actualEndDate: '2024-10-15',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.SCOPE,
    delayReasonNote: 'Scope expanded to include dark mode and accessibility features.'
  },
  {
    id: 't13',
    projectId: 'p4',
    name: 'Frontend Implementation',
    assignedDept: 'Mobile Development',
    plannedEndDate: '2024-11-30',
    actualEndDate: '2024-12-15',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.TECHNICAL,
    delayReasonNote: 'Performance optimization required additional iteration cycles.'
  },

  // Project 5 Tasks (Data Warehouse - Completed)
  {
    id: 't14',
    projectId: 'p5',
    name: 'Current State Analysis',
    assignedDept: 'Data Engineering',
    plannedEndDate: '2024-08-01',
    actualEndDate: '2024-07-30',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't15',
    projectId: 'p5',
    name: 'Schema Redesign',
    assignedDept: 'Data Architecture',
    plannedEndDate: '2024-08-25',
    actualEndDate: '2024-08-24',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't16',
    projectId: 'p5',
    name: 'Migration & Testing',
    assignedDept: 'Data Engineering',
    plannedEndDate: '2024-10-01',
    actualEndDate: '2024-09-28',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },

  // Project 6 Tasks (Customer Portal - Active)
  {
    id: 't17',
    projectId: 'p6',
    name: 'Requirements Gathering',
    assignedDept: 'Product',
    plannedEndDate: '2024-10-20',
    actualEndDate: '2024-10-18',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't18',
    projectId: 'p6',
    name: 'Backend API Development',
    assignedDept: 'Engineering',
    plannedEndDate: '2024-11-30',
    status: TaskStatus.IN_PROGRESS
  },
  {
    id: 't19',
    projectId: 'p6',
    name: 'Frontend Development',
    assignedDept: 'Frontend Team',
    plannedEndDate: '2024-12-25',
    status: TaskStatus.PENDING
  },

  // Project 7 Tasks (Marketing Automation - Active)
  {
    id: 't20',
    projectId: 'p7',
    name: 'Platform Selection',
    assignedDept: 'Marketing',
    plannedEndDate: '2024-09-20',
    actualEndDate: '2024-09-18',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.NONE
  },
  {
    id: 't21',
    projectId: 'p7',
    name: 'Integration Setup',
    assignedDept: 'Engineering',
    plannedEndDate: '2024-11-15',
    status: TaskStatus.IN_PROGRESS
  },
  {
    id: 't22',
    projectId: 'p7',
    name: 'Campaign Templates',
    assignedDept: 'Marketing',
    plannedEndDate: '2024-12-15',
    status: TaskStatus.PENDING
  },

  // Project 8 Tasks (API Gateway - Delayed)
  {
    id: 't23',
    projectId: 'p8',
    name: 'Architecture Design',
    assignedDept: 'Platform Engineering',
    plannedEndDate: '2024-07-15',
    actualEndDate: '2024-07-28',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.COMMUNICATION,
    delayReasonNote: 'Multiple teams needed alignment on service boundaries.'
  },
  {
    id: 't24',
    projectId: 'p8',
    name: 'Service Migration',
    assignedDept: 'Backend Team',
    plannedEndDate: '2024-08-30',
    actualEndDate: '2024-09-20',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.EXTERNAL,
    delayReasonNote: 'Third-party authentication provider had integration issues.'
  },
  {
    id: 't25',
    projectId: 'p8',
    name: 'Load Testing & Optimization',
    assignedDept: 'DevOps',
    plannedEndDate: '2024-09-30',
    actualEndDate: '2024-10-20',
    status: TaskStatus.COMPLETED,
    delayReasonCategory: DelayReasonCategory.TECHNICAL,
    delayReasonNote: 'Performance bottlenecks required additional optimization work.'
  }
];

const MOCK_DEPENDENCIES = [
  // Project 1 Chain
  { id: 'd1', parentTaskId: 't1', childTaskId: 't2' },
  { id: 'd2', parentTaskId: 't2', childTaskId: 't3' },
  { id: 'd3', parentTaskId: 't3', childTaskId: 't4' },
  // Project 2 Chain
  { id: 'd4', parentTaskId: 't5', childTaskId: 't6' },
  { id: 'd5', parentTaskId: 't6', childTaskId: 't7' },
  // Project 3 Chain
  { id: 'd6', parentTaskId: 't8', childTaskId: 't9' },
  { id: 'd7', parentTaskId: 't9', childTaskId: 't10' },
  // Project 4 Chain
  { id: 'd8', parentTaskId: 't11', childTaskId: 't12' },
  { id: 'd9', parentTaskId: 't12', childTaskId: 't13' },
  // Project 5 Chain
  { id: 'd10', parentTaskId: 't14', childTaskId: 't15' },
  { id: 'd11', parentTaskId: 't15', childTaskId: 't16' },
  // Project 6 Chain
  { id: 'd12', parentTaskId: 't17', childTaskId: 't18' },
  { id: 'd13', parentTaskId: 't18', childTaskId: 't19' },
  // Project 7 Chain
  { id: 'd14', parentTaskId: 't20', childTaskId: 't21' },
  { id: 'd15', parentTaskId: 't21', childTaskId: 't22' },
  // Project 8 Chain
  { id: 'd16', parentTaskId: 't23', childTaskId: 't24' },
  { id: 'd17', parentTaskId: 't24', childTaskId: 't25' }
];