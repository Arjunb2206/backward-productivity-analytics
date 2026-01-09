
export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Department Manager',
  VIEWER = 'Viewer'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue'
}

export enum DelayReasonCategory {
  NONE = 'None',
  APPROVAL = 'Approval Delay',
  RESOURCE = 'Resource Unavailable',
  TECHNICAL = 'Technical Difficulty',
  SCOPE = 'Scope Change',
  DEPENDENCY = 'Dependency Failure'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  status: 'Active' | 'Completed' | 'Delayed';
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  assignedDept: string;
  plannedEndDate: string;
  actualEndDate?: string;
  status: TaskStatus;
  delayReasonCategory?: DelayReasonCategory;
  delayReasonNote?: string;
}

export interface TaskDependency {
  id: string;
  parentTaskId: string; // The blocker
  childTaskId: string;  // The blocked task
}

export interface DelayTraceNode {
  task: Task;
  delayDays: number;
  isRootCause: boolean;
}

export interface AIRecoveryPlan {
  analysis: string;
  steps: string[];
  riskMitigation: string;
}
