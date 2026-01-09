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
    
    return `
      <tr>
        <td>
          <div class="font-medium text-slate-900">${escapeHtml(task.name)}</div>
          <div class="text-xs text-slate-400">Depends on: ${escapeHtml(dependencies)}</div>
        </td>
        <td class="text-sm text-slate-600">${escapeHtml(task.assignedDept)}</td>
        <td class="text-sm">
          <span class="badge ${statusBadge}">${escapeHtml(task.status)}</span>
        </td>
        <td class="text-sm text-slate-600">${task.plannedEndDate}</td>
        ${user.role !== Role.VIEWER ? `
          <td class="text-sm font-medium">
            ${task.status !== TaskStatus.COMPLETED ? `
              <button onclick="openCompleteModal('${task.id}')" class="text-blue-600 hover:text-blue-900">
                Mark Complete
              </button>
            ` : `
              <span class="text-slate-300">Done</span>
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
  
  const actualEndEl = document.getElementById('projectActualEnd');
  actualEndEl.textContent = currentProject.actualEndDate || 'Pending';
  actualEndEl.className = `text-sm font-bold ${currentProject.status === 'Delayed' ? 'text-red-600' : 'text-green-600'}`;
}

function renderMetrics() {
  const completedTasks = currentTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const completionRate = currentTasks.length > 0 
    ? Math.round((completedTasks / currentTasks.length) * 100) 
    : 0;
  
  document.getElementById('completionRate').textContent = completionRate + '%';
  document.getElementById('progressBar').style.width = completionRate + '%';
  document.getElementById('completionText').textContent = 
    `${completedTasks} of ${currentTasks.length} sub-tasks finalized`;
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