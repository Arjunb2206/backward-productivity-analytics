
import { Role, Project, Task, TaskStatus, TaskDependency, DelayReasonCategory } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Q3 Enterprise Cloud Migration',
    description: 'Decommissioning legacy physical servers and migrating core databases to high-availability cloud instances.',
    plannedStartDate: '2024-06-01',
    plannedEndDate: '2024-08-30',
    actualEndDate: '2024-09-18',
    status: 'Delayed'
  },
  {
    id: 'p2',
    name: 'Annual Security Compliance Audit',
    description: 'Mandatory SOC2 Type II audit and internal security hardening across all departments.',
    plannedStartDate: '2024-07-01',
    plannedEndDate: '2024-10-15',
    actualEndDate: '2024-10-12',
    status: 'Completed'
  },
  {
    id: 'p3',
    name: 'AI Model Integration',
    description: 'Integrating new LLM capabilities into the primary customer support platform.',
    plannedStartDate: '2024-09-15',
    plannedEndDate: '2024-12-20',
    status: 'Active'
  }
];

export const MOCK_TASKS: Task[] = [
  // Project 1 Tasks (The Delayed Project)
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

  // Project 2 Tasks (The On-Time Project)
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

  // Project 3 Tasks (Active)
  {
    id: 't8',
    projectId: 'p3',
    name: 'Prompt Engineering Strategy',
    assignedDept: 'Product',
    plannedEndDate: '2024-10-01',
    status: TaskStatus.IN_PROGRESS
  },
  {
    id: 't9',
    projectId: 'p3',
    name: 'API Gateway Implementation',
    assignedDept: 'Engineering',
    plannedEndDate: '2024-11-15',
    status: TaskStatus.PENDING
  }
];

export const MOCK_DEPENDENCIES: TaskDependency[] = [
  // Project 1 Chain
  { id: 'd1', parentTaskId: 't1', childTaskId: 't2' },
  { id: 'd2', parentTaskId: 't2', childTaskId: 't3' },
  { id: 'd3', parentTaskId: 't3', childTaskId: 't4' },
  // Project 2 Chain
  { id: 'd4', parentTaskId: 't5', childTaskId: 't6' },
  { id: 'd5', parentTaskId: 't6', childTaskId: 't7' },
  // Project 3 Chain
  { id: 'd6', parentTaskId: 't8', childTaskId: 't9' }
];
