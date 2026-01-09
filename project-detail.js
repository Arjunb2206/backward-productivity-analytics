// Project Detail Page Logic

let currentProject = null;
let currentTasks = [];
let currentDependencies = [];
let selectedTask = null;

function initProjectDetail() {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  renderNavBar(user);
  
  const projectId = getQueryParam('id');
  if (!projectId) {
    navigateTo('dashboard.html');
    return;
  }
  
  currentProject = appState.getProject(projectId);
  if (!currentProject) {
    alert('Project not found');
    navigateTo('dashboard.html');
    return;
  }
  
  currentTasks = appState.getTasks(projectId);
  currentDependencies = appState.getDependencies(projectId);
  
  renderProjectDetail(user);
}

function renderProjectDetail(user) {
  // Render header
  const badgeClass = getStatusBadgeClass(currentProject.status);
  document.getElementById('projectName').textContent = currentProject.name;
  document.getElementById('projectStatus').className = `badge ${badgeClass}`;
  document.getElementById('projectStatus').textContent = currentProject.status;
  document.getElementById('projectId').textContent = `Project ID: ${currentProject.id}`;
  
  // Show/hide analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (currentProject.status === 'Delayed') {
    analyzeBtn.style.display = 'inline-flex';
  } else {
    analyzeBtn.style.display = 'none';
  }
  
  // Show/hide add task button based on role
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (user.role === Role.VIEWER) {
    addTaskBtn.style.display = 'none';
  }
  
  // Render task table
  renderTaskTable(user);
  
  // Render project summary
  renderProjectSummary();
  
  // Render metrics
  renderMetrics();
}

function renderTaskTable(user) {
  const tbody = document.getElementById('taskTableBody');
  
  tbody.innerHTML = currentTasks.map(task => {
    const dependencies = currentDependencies
      .filter(d => d.childTaskId === task.id)
      .map(d => {
        const parent = currentTasks.find(t => t.id === d.parentTaskId);
        return parent ? parent.name : 'Unknown';
      })
      .join(', ') || 'None';
    
    const statusBadge = getStatusBadgeClass(task.status);
    const isDelayed = task.actualEndDate && new Date(task.actualEndDate) > new Date(task.plannedEndDate);
    const rowStyle = isDelayed ? 'background: #fef2f2;' : '';
    
    return `
      <tr style="${rowStyle} border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 1rem;">
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${escapeHtml(task.name)}</div>
          <div style="font-size: 0.75rem; color: #64748b;">Dependencies: ${escapeHtml(dependencies)}</div>
        </td>
        <td style="padding: 1rem; color: #64748b;">${escapeHtml(task.assignedDept)}</td>
        <td style="padding: 1rem;">
          <span class="badge ${statusBadge}">${escapeHtml(task.status)}</span>
        </td>
        <td style="padding: 1rem; color: #64748b;">${task.plannedEndDate}</td>
        ${user.role !== Role.VIEWER ? `
          <td style="padding: 1rem;">
            ${task.status !== TaskStatus.COMPLETED ? `
              <button onclick="openCompleteModal('${task.id}')" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.875rem;">
                Mark Complete
              </button>
            ` : `
              <span style="color: #16a34a; font-weight: 600;">✓ Done</span>
            `}
          </td>
        ` : ''}
      </tr>
    `;
  }).join('');
  
  // Hide actions column if viewer
  const actionsHeader = document.getElementById('actionsHeader');
  if (user.role === Role.VIEWER && actionsHeader) {
    actionsHeader.style.display = 'none';
  }
}

function renderProjectSummary() {
  document.getElementById('projectDescription').textContent = currentProject.description;
  document.getElementById('projectPlannedEnd').textContent = currentProject.plannedEndDate;
  document.getElementById('projectDepartment').textContent = currentProject.department;
  document.getElementById('projectBudget').textContent = '$' + currentProject.budget.toLocaleString();
  
  const actualEndEl = document.getElementById('projectActualEnd');
  actualEndEl.textContent = currentProject.actualEndDate || 'In Progress';
  actualEndEl.className = `text-sm font-bold ${currentProject.status === 'Delayed' ? 'text-red-600' : currentProject.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`;
  actualEndEl.style.fontSize = '1.125rem';
  actualEndEl.style.fontWeight = '600';
  actualEndEl.style.margin = '0';
}

function renderMetrics() {
  const completedTasks = currentTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const completionRate = currentTasks.length > 0 
    ? Math.round((completedTasks / currentTasks.length) * 100) 
    : 0;
  
  document.getElementById('completionRate').textContent = completionRate + '%';
  document.getElementById('progressBar').style.width = completionRate + '%';
  document.getElementById('completionText').textContent = 
    `${completedTasks} of ${currentTasks.length} tasks completed`;
}

function openCompleteModal(taskId) {
  selectedTask = appState.getTask(taskId);
  if (!selectedTask) return;
  
  document.getElementById('modalTaskName').textContent = selectedTask.name;
  document.getElementById('completionDate').value = getCurrentDate();
  document.getElementById('delayReason').value = DelayReasonCategory.NONE;
  document.getElementById('delayNote').value = '';
  
  // Hide delay section initially
  document.getElementById('delaySection').style.display = 'none';
  
  // Show modal
  document.getElementById('completeModal').style.display = 'flex';
}

function closeCompleteModal() {
  document.getElementById('completeModal').style.display = 'none';
  selectedTask = null;
}

function checkDelayStatus() {
  if (!selectedTask) return;
  
  const completionDate = document.getElementById('completionDate').value;
  const plannedDate = selectedTask.plannedEndDate;
  
  const delaySection = document.getElementById('delaySection');
  if (isLate(plannedDate, completionDate)) {
    delaySection.style.display = 'block';
    delaySection.classList.add('animate-fadeIn');
  } else {
    delaySection.style.display = 'none';
  }
}

function submitCompletion() {
  if (!selectedTask) return;
  
  const completionDate = document.getElementById('completionDate').value;
  const plannedDate = selectedTask.plannedEndDate;
  const isTaskLate = isLate(plannedDate, completionDate);
  
  if (isTaskLate) {
    const delayReason = document.getElementById('delayReason').value;
    if (delayReason === DelayReasonCategory.NONE) {
      alert('Please select a reason for the delay.');
      return;
    }
  }
  
  const delayNote = document.getElementById('delayNote').value;
  const delayReason = document.getElementById('delayReason').value;
  
  const updates = {
    status: TaskStatus.COMPLETED,
    actualEndDate: completionDate,
    delayReasonCategory: isTaskLate ? delayReason : DelayReasonCategory.NONE,
    delayReasonNote: isTaskLate ? delayNote : undefined
  };
  
  appState.updateTask(selectedTask.id, updates);
  
  closeCompleteModal();
  
  // Reload page to reflect changes
  location.reload();
}

function goBack() {
  navigateTo('dashboard.html');
}

function goToAnalysis() {
  navigateTo('analysis.html', { id: currentProject.id });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectDetail);
} else {
  initProjectDetail();
}
