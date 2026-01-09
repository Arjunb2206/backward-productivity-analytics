// Dashboard Page Logic

function initDashboard() {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  renderNavBar(user);
  renderDashboard(user);
}

function renderDashboard(user) {
  const projects = appState.getProjects();
  const tasks = appState.getTasks();
  
  const delayedProjects = projects.filter(p => p.status === 'Delayed');
  const overdueTasksCount = tasks.filter(t => t.status === TaskStatus.OVERDUE).length;
  
  // Render stats with animation
  animateValue('totalProjects', 0, projects.length, 1000);
  animateValue('delayedProjects', 0, delayedProjects.length, 1000);
  animateValue('overdueTasks', 0, overdueTasksCount, 1000);
  
  // Update project count
  document.getElementById('projectCount').textContent = projects.length;
  
  // Render project list
  renderProjectList(projects, tasks, user);
  
  // Render delay chart
  renderDelayChart(tasks);
  
  // Show/hide create button based on role
  const createBtn = document.getElementById('createProjectBtn');
  if (user.role === Role.VIEWER) {
    createBtn.style.display = 'none';
  }
}

function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current);
  }, 16);
}

function renderProjectList(projects, tasks, user) {
  const container = document.getElementById('projectList');
  
  if (projects.length === 0) {
    container.innerHTML = '<div class="empty-state">No projects created yet. Click "Create Project" to get started.</div>';
    return;
  }
  
  container.innerHTML = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completedTasks = projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const badgeClass = getStatusBadgeClass(project.status);
    const progressPercent = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
    
    return `
      <div class="project-item">
        <div style="flex: 1; min-width: 0;">
          <div class="flex items-center space-x-3" style="flex-wrap: wrap;">
            <h3 class="project-item-title">${escapeHtml(project.name)}</h3>
            <span class="badge ${badgeClass}">${escapeHtml(project.status)}</span>
            ${project.priority ? `<span class="badge" style="background: var(--indigo-100); color: var(--indigo-700);">${escapeHtml(project.priority)}</span>` : ''}
          </div>
          <div class="project-item-meta">
            <span class="flex items-center">
              <svg class="w-3.5 h-3.5" style="margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Goal: ${project.plannedEndDate}
            </span>
            <span style="color: var(--slate-300);">|</span>
            <span>${projectTasks.length} Tasks (${completedTasks} done)</span>
            <span style="color: var(--slate-300);">|</span>
            <span>${escapeHtml(project.department)}</span>
          </div>
          <div class="progress-bar" style="margin-top: 0.75rem;">
            <div class="progress-fill" style="width: ${progressPercent}%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
          </div>
        </div>
        <div class="flex space-x-2" style="flex-shrink: 0;">
          <button onclick="navigateTo('project-detail.html', {id: '${project.id}'})" class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Details
          </button>
          ${project.status === 'Delayed' ? `
            <button onclick="navigateTo('analysis.html', {id: '${project.id}'})" class="btn btn-danger">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analyze
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderDelayChart(tasks) {
  const delayReasons = tasks
    .filter(t => t.delayReasonCategory && t.delayReasonCategory !== DelayReasonCategory.NONE)
    .reduce((acc, task) => {
      const existing = acc.find(a => a.name === task.delayReasonCategory);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: task.delayReasonCategory, value: 1 });
      }
      return acc;
    }, []);

  const chartContainer = document.getElementById('delayChart');
  const legendContainer = document.getElementById('delayLegend');
  
  if (delayReasons.length === 0) {
    chartContainer.innerHTML = `
      <div class="chart-empty">
        <div class="chart-empty-icon">
          <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p class="text-slate-400 italic text-sm">No delay data captured yet.</p>
        <p class="text-slate-300 text-xs mt-2">Delays will appear here when projects encounter issues.</p>
      </div>
    `;
    legendContainer.innerHTML = '';
    return;
  }

  // Create pie chart using Chart.js
  const canvas = document.createElement('canvas');
  chartContainer.innerHTML = '';
  chartContainer.appendChild(canvas);
  
  const colors = ['#667eea', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];
  
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: delayReasons.map(r => r.name),
      datasets: [{
        data: delayReasons.map(r => r.value),
        backgroundColor: colors.slice(0, delayReasons.length),
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          cornerRadius: 8
        }
      },
      cutout: '70%'
    }
  });

  // Render legend
  legendContainer.innerHTML = delayReasons.map((r, i) => `
    <div class="legend-item">
      <div class="legend-label">
        <div class="legend-color" style="background-color: ${colors[i]};"></div>
        <span class="legend-text">${escapeHtml(r.name)}</span>
      </div>
      <span class="legend-value">${r.value}</span>
    </div>
  `).join('');
}

function showCreateProjectModal() {
  const name = prompt('Enter project name:');
  if (!name) return;
  
  const description = prompt('Enter project description:');
  if (!description) return;
  
  const department = prompt('Enter department:');
  if (!department) return;
  
  const plannedEndDate = prompt('Enter planned end date (YYYY-MM-DD):');
  if (!plannedEndDate) return;
  
  const priority = prompt('Enter priority (Low/Medium/High/Critical):') || 'Medium';
  
  const newProject = {
    id: 'p' + generateId(),
    name: name,
    description: description,
    department: department,
    plannedStartDate: getCurrentDate(),
    plannedEndDate: plannedEndDate,
    status: 'Active',
    priority: priority,
    budget: 0
  };
  
  appState.addProject(newProject);
  navigateTo('project-detail.html', { id: newProject.id });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}