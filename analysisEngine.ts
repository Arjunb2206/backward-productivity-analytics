
import { Task, TaskDependency, Project, DelayTraceNode } from '../types';

/**
 * Backward Analysis Engine
 * Traces the chain of delays from the final delayed task back to the root cause.
 */
export const performBackwardAnalysis = (
  project: Project,
  tasks: Task[],
  dependencies: TaskDependency[]
): DelayTraceNode[] => {
  if (!project.actualEndDate || new Date(project.actualEndDate) <= new Date(project.plannedEndDate)) {
    return [];
  }

  // 1. Identify all tasks that finished after the project's planned end date
  const lateTasks = tasks.filter(t => t.actualEndDate && new Date(t.actualEndDate) > new Date(project.plannedEndDate));
  
  if (lateTasks.length === 0) return [];

  // 2. Start with the absolute latest task (the one that effectively finished the project)
  let currentTask = lateTasks.reduce((prev, current) => {
    return (new Date(current.actualEndDate!) > new Date(prev.actualEndDate!)) ? current : prev;
  });

  const trace: DelayTraceNode[] = [];
  const visited = new Set<string>();

  while (currentTask && !visited.has(currentTask.id)) {
    visited.add(currentTask.id);
    
    const planned = new Date(currentTask.plannedEndDate);
    const actual = new Date(currentTask.actualEndDate!);
    const delayMs = actual.getTime() - planned.getTime();
    const delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24));

    // Find dependencies of this task
    const parentDeps = dependencies.filter(d => d.childTaskId === currentTask.id);
    const parents = tasks.filter(t => parentDeps.some(d => d.parentTaskId === t.id));

    // Find the parent that finished latest (the primary blocker)
    const latestParent = parents.length > 0 
      ? parents.reduce((prev, curr) => {
          if (!prev.actualEndDate) return curr;
          if (!curr.actualEndDate) return prev;
          return new Date(curr.actualEndDate) > new Date(prev.actualEndDate) ? curr : prev;
        })
      : null;

    // A task is a root cause if it was late but its primary parent wasn't late enough to be the sole cause
    // Or if it has no parents and is late.
    let isRootCause = false;
    if (!latestParent) {
      isRootCause = true;
    } else if (latestParent.actualEndDate) {
       const parentEnd = new Date(latestParent.actualEndDate);
       const currentPlanned = new Date(currentTask.plannedEndDate);
       // If this task was planned to end AFTER the parent, but it ended even later than that buffer allowed
       if (parentEnd <= currentPlanned && actual > currentPlanned) {
         isRootCause = true;
       }
    }

    trace.push({
      task: currentTask,
      delayDays,
      isRootCause
    });

    // If we found a root cause or have no more parents to trace, stop.
    if (isRootCause || !latestParent) break;

    // Move backward to the blocker
    currentTask = latestParent;
  }

  return trace.reverse(); // Return from Root Cause to Final Delay
};
