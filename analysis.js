// Analysis Page Logic and Backward Analysis Engine

let analysisProject = null;
let analysisTasks = [];
let analysisDependencies = [];
let traceNodes = [];
let aiPlan = null;

function initAnalysis() {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  renderNavBar(user);
  
  const projectId = getQueryParam('id');
  if (!projectId) {
    navigateTo('dashboard.html');
    return;
  }
  
  analysisProject = appState.getProject(projectId);
  if (!analysisProject) {
    alert('Project not found');
    navigateTo('dashboard.html');
    return;
  }
  
  analysisTasks = appState.getTasks(projectId);
  analysisDependencies = appState.getDependencies(projectId);
  
  // Perform backward analysis
  traceNodes = performBackwardAnalysis(analysisProject, analysisTasks, analysisDependencies);
  
  renderAnalysis();
}

// Backward Analysis Engine
function performBackwardAnalysis(project, tasks, dependencies) {
  if (!project.actualEndDate || new Date(project.actualEndDate) <= new Date(project.plannedEndDate)) {
    return [];
  }

  // 1. Identify all tasks that finished after the project's planned end date
  const lateTasks = tasks.filter(t => t.actualEndDate && new Date(t.actualEndDate) > new Date(project.plannedEndDate));
  
  if (lateTasks.length === 0) return [];

  // 2. Start with the absolute latest task
  let currentTask = lateTasks.reduce((prev, current) => {
    return (new Date(current.actualEndDate) > new Date(prev.actualEndDate)) ? current : prev;
  });

  const trace = [];
  const visited = new Set();

  while (currentTask && !visited.has(currentTask.id)) {
    visited.add(currentTask.id);
    
    const planned = new Date(currentTask.plannedEndDate);
    const actual = new Date(currentTask.actualEndDate);
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

    // A task is a root cause if it was late but its primary parent wasn't late enough
    let isRootCause = false;
    if (!latestParent) {
      isRootCause = true;
    } else if (latestParent.actualEndDate) {
       const parentEnd = new Date(latestParent.actualEndDate);
       const currentPlanned = new Date(currentTask.plannedEndDate);
       if (parentEnd <= currentPlanned && actual > currentPlanned) {
         isRootCause = true;
       }
    }

    trace.push({
      task: currentTask,
      delayDays: delayDays,
      isRootCause: isRootCause
    });

    if (isRootCause || !latestParent) break;

    currentTask = latestParent;
  }

  return trace.reverse(); // Return from Root Cause to Final Delay
}

function renderAnalysis() {
  const rootCause = traceNodes.find(t => t.isRootCause);
  const totalDelayDays = Math.ceil(
    (new Date(analysisProject.actualEndDate).getTime() - new Date(analysisProject.plannedEndDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  // Render analysis header
  const headerHtml = `
    <div style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 2rem;">
      <h1 id="projectName" style="font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem;">${escapeHtml(analysisProject.name)}</h1>
      <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.875rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Delay</span>
          <div style="font-size: 2.5rem; font-weight: 800; color: #dc2626;"><span id="totalDelayDays">${totalDelayDays}</span> days</div>
        </div>
        <div>
          <span style="font-size: 0.875rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Status</span>
          <div style="font-size: 1.25rem; font-weight: 700; color: #dc2626;">${escapeHtml(analysisProject.status)}</div>
        </div>
        <div>
          <span style="font-size: 0.875rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Department</span>
          <div style="font-size: 1.25rem; font-weight: 700; color: #1e293b;">${escapeHtml(analysisProject.department)}</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('analysisHeader').innerHTML = headerHtml;
  
  // Render timeline visualization
  renderTimelineViz();
  
  // Render root causes
  renderRootCausesViz(rootCause);
  
  // Render task analysis
  renderTaskAnalysis();
}

function renderTimelineViz() {
  const container = document.getElementById('timelineViz');
  
  const html = traceNodes.map((node, index) => {
    const rootClass = node.isRootCause ? 'background: #fee2e2; border-left: 4px solid #dc2626;' : 'background: #fef3c7; border-left: 4px solid #f59e0b;';
    
    return `
      <div style="${rootClass} padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <div style="flex: 1;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 0.25rem;">${escapeHtml(node.task.name)}</div>
            <div style="font-size: 0.875rem; color: #64748b;">${escapeHtml(node.task.assignedDept)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: 800; color: #dc2626;">+${node.delayDays}d</div>
            ${node.isRootCause ? '<div style="font-size: 0.75rem; color: #dc2626; font-weight: 700;">ROOT CAUSE</div>' : ''}
          </div>
        </div>
        <div style="font-size: 0.875rem; color: #475569; font-style: italic;">
          "${escapeHtml(node.task.delayReasonNote || 'System-detected cascade from parent blocker.')}"
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html || '<p style="color: #64748b;">No delay timeline available.</p>';
}

function renderRootCausesViz(rootCause) {
  const container = document.getElementById('rootCauses');
  
  if (!rootCause) {
    container.innerHTML = '<p style="color: #64748b;">No root cause identified.</p>';
    return;
  }
  
  const delayCategories = {};
  analysisTasks.forEach(task => {
    if (task.delayReasonCategory && task.delayReasonCategory !== 'None') {
      delayCategories[task.delayReasonCategory] = (delayCategories[task.delayReasonCategory] || 0) + 1;
    }
  });
  
  const html = `
    <div style="background: #fee2e2; padding: 1.5rem; border-radius: 12px; border: 2px solid #fecaca; margin-bottom: 1rem;">
      <div style="font-size: 1.125rem; font-weight: 700; color: #991b1b; margin-bottom: 0.5rem;">Primary Root Cause</div>
      <div style="font-size: 1.5rem; font-weight: 800; color: #7f1d1d; margin-bottom: 0.5rem;">${escapeHtml(rootCause.task.name)}</div>
      <div style="color: #991b1b; margin-bottom: 0.75rem;">${escapeHtml(rootCause.task.assignedDept)} • ${escapeHtml(rootCause.task.delayReasonCategory)}</div>
      <div style="background: white; padding: 1rem; border-radius: 8px; font-size: 0.875rem; color: #7f1d1d; font-style: italic;">
        "${escapeHtml(rootCause.task.delayReasonNote || 'No specific reason provided.')}"
      </div>
    </div>
    
    <div style="font-weight: 700; color: #1e293b; margin-bottom: 0.75rem;">Delay Categories Distribution</div>
    ${Object.entries(delayCategories).map(([category, count]) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.5rem;">
        <span style="font-size: 0.875rem; color: #475569;">${escapeHtml(category)}</span>
        <span style="font-weight: 700; color: #1e293b;">${count} task${count > 1 ? 's' : ''}</span>
      </div>
    `).join('')}
  `;
  
  container.innerHTML = html;
}

function renderTaskAnalysis() {
  const container = document.getElementById('taskAnalysis');
  
  const html = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 0.75rem; text-align: left; font-weight: 700; color: #475569; font-size: 0.875rem;">Task Name</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 700; color: #475569; font-size: 0.875rem;">Department</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 700; color: #475569; font-size: 0.875rem;">Status</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 700; color: #475569; font-size: 0.875rem;">Planned End</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 700; color: #475569; font-size: 0.875rem;">Actual End</th>
            <th style="padding: 0.75rem; text-align: left; font-weight: 700; color: #475569; font-size: 0.875rem;">Delay Reason</th>
          </tr>
        </thead>
        <tbody>
          ${analysisTasks.map(task => {
            const isDelayed = task.actualEndDate && new Date(task.actualEndDate) > new Date(task.plannedEndDate);
            const rowStyle = isDelayed ? 'background: #fef2f2;' : '';
            
            return `
              <tr style="${rowStyle} border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.75rem; font-weight: 600; color: #1e293b;">${escapeHtml(task.name)}</td>
                <td style="padding: 0.75rem; color: #64748b; font-size: 0.875rem;">${escapeHtml(task.assignedDept)}</td>
                <td style="padding: 0.75rem;">
                  <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; ${
                    task.status === 'Completed' ? 'background: #dcfce7; color: #166534;' :
                    task.status === 'In Progress' ? 'background: #dbeafe; color: #1e40af;' :
                    task.status === 'Overdue' ? 'background: #fee2e2; color: #991b1b;' :
                    'background: #f1f5f9; color: #475569;'
                  }">
                    ${escapeHtml(task.status)}
                  </span>
                </td>
                <td style="padding: 0.75rem; color: #64748b; font-size: 0.875rem;">${task.plannedEndDate}</td>
                <td style="padding: 0.75rem; color: ${isDelayed ? '#dc2626' : '#64748b'}; font-size: 0.875rem; font-weight: ${isDelayed ? '700' : '400'};">
                  ${task.actualEndDate || 'Pending'}
                </td>
                <td style="padding: 0.75rem; color: #64748b; font-size: 0.875rem;">
                  ${task.delayReasonCategory && task.delayReasonCategory !== 'None' ? escapeHtml(task.delayReasonCategory) : '-'}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

function showGeminiSummary() {
  const modal = document.getElementById('geminiModal');
  modal.style.display = 'flex';
  
  // Show loading
  document.getElementById('geminiLoading').style.display = 'block';
  document.getElementById('geminiContent').style.display = 'none';
  
  // Simulate AI processing
  setTimeout(() => {
    generateGeminiSummary();
  }, 1500);
}

function closeGeminiModal() {
  document.getElementById('geminiModal').style.display = 'none';
}

function generateGeminiSummary() {
  const totalDelayDays = Math.ceil(
    (new Date(analysisProject.actualEndDate).getTime() - new Date(analysisProject.plannedEndDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  const rootCause = traceNodes.find(t => t.isRootCause);
  const delayedTasks = analysisTasks.filter(t => t.actualEndDate && new Date(t.actualEndDate) > new Date(t.plannedEndDate));
  
  // Generate overview
  const overviewHtml = `
    <p style="margin: 0;"><strong>Project:</strong> ${escapeHtml(analysisProject.name)}</p>
    <p style="margin: 0.5rem 0 0 0;"><strong>Total Delay:</strong> ${totalDelayDays} days beyond planned completion</p>
    <p style="margin: 0.5rem 0 0 0;"><strong>Affected Tasks:</strong> ${delayedTasks.length} out of ${analysisTasks.length} tasks experienced delays</p>
  `;
  document.getElementById('geminiOverview').innerHTML = overviewHtml;
  
  // Generate problems list
  const problemsHtml = delayedTasks.map((task, index) => {
    const delayDays = Math.ceil(
      (new Date(task.actualEndDate).getTime() - new Date(task.plannedEndDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    return `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem;">
        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 0.5rem;">
          <div style="flex: 1;">
            <div style="font-weight: 700; color: #991b1b; margin-bottom: 0.25rem;">Problem ${index + 1}: ${escapeHtml(task.name)}</div>
            <div style="font-size: 0.875rem; color: #7f1d1d;">Department: ${escapeHtml(task.assignedDept)}</div>
          </div>
          <div style="background: #fee2e2; color: #991b1b; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; margin-left: 1rem;">
            +${delayDays} days
          </div>
        </div>
        <div style="font-size: 0.875rem; color: #7f1d1d; margin-top: 0.5rem;">
          <strong>Planned:</strong> ${task.plannedEndDate} → <strong>Actual:</strong> ${task.actualEndDate}
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('geminiProblems').innerHTML = problemsHtml;
  
  // Generate causes analysis
  const causesHtml = delayedTasks.map((task, index) => {
    return `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem;">
        <div style="font-weight: 700; color: #1e40af; margin-bottom: 0.5rem;">${escapeHtml(task.name)}</div>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
            ${escapeHtml(task.delayReasonCategory || 'Unspecified')}
          </span>
          ${task.isRootCause ? '<span style="background: #fee2e2; color: #991b1b; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">ROOT CAUSE</span>' : ''}
        </div>
        <div style="font-size: 0.875rem; color: #1e3a8a; font-style: italic;">
          "${escapeHtml(task.delayReasonNote || 'No specific cause documented.')}"
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('geminiCauses').innerHTML = causesHtml;
  
  // Generate delays breakdown
  const delaysHtml = delayedTasks.map((task, index) => {
    const delayDays = Math.ceil(
      (new Date(task.actualEndDate).getTime() - new Date(task.plannedEndDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const delayPercentage = Math.round((delayDays / totalDelayDays) * 100);
    
    return `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <div style="font-weight: 700; color: #92400e;">${escapeHtml(task.name)}</div>
            <div style="font-size: 0.875rem; color: #78350f;">${escapeHtml(task.assignedDept)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: 800; color: #92400e;">${delayDays}d</div>
            <div style="font-size: 0.75rem; color: #78350f;">${delayPercentage}% of total</div>
          </div>
        </div>
        <div style="background: #fef3c7; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: #f59e0b; height: 100%; width: ${delayPercentage}%;"></div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('geminiDelays').innerHTML = delaysHtml;
  
  // Generate recommendations
  const recommendationsHtml = `
    <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; list-style: none;">
      <li style="margin-bottom: 0.5rem; position: relative; padding-left: 1.5rem;">
        <span style="position: absolute; left: 0; color: #1e40af; font-weight: 700;">1.</span>
        Schedule immediate post-mortem with ${rootCause ? rootCause.task.assignedDept : 'affected departments'} to document lessons learned
      </li>
      <li style="margin-bottom: 0.5rem; position: relative; padding-left: 1.5rem;">
        <span style="position: absolute; left: 0; color: #1e40af; font-weight: 700;">2.</span>
        Add ${Math.max(5, Math.ceil(totalDelayDays/2))} day buffer to similar tasks in future project templates
      </li>
      <li style="margin-bottom: 0.5rem; position: relative; padding-left: 1.5rem;">
        <span style="position: absolute; left: 0; color: #1e40af; font-weight: 700;">3.</span>
        Implement early warning system for ${rootCause ? rootCause.task.delayReasonCategory : 'resource constraints'}
      </li>
      <li style="margin-bottom: 0.5rem; position: relative; padding-left: 1.5rem;">
        <span style="position: absolute; left: 0; color: #1e40af; font-weight: 700;">4.</span>
        Consider cross-training team members to reduce single points of failure
      </li>
      <li style="position: relative; padding-left: 1.5rem;">
        <span style="position: absolute; left: 0; color: #1e40af; font-weight: 700;">5.</span>
        Establish daily standups for remaining critical path tasks
      </li>
    </ul>
  `;
  document.getElementById('geminiRecommendations').innerHTML = recommendationsHtml;
  
  // Hide loading and show content
  document.getElementById('geminiLoading').style.display = 'none';
  document.getElementById('geminiContent').style.display = 'block';
}

function goBack() {
  navigateTo('project-detail.html', { id: analysisProject.id });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalysis);
} else {
  initAnalysis();
}
