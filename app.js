// Main Application State Management

class AppState {
  constructor() {
    this.projects = deepClone(MOCK_PROJECTS);
    this.tasks = deepClone(MOCK_TASKS);
    this.dependencies = deepClone(MOCK_DEPENDENCIES);
    this.loadFromStorage();
  }

  loadFromStorage() {
    const savedProjects = localStorage.getItem('projects');
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedProjects) {
      this.projects = JSON.parse(savedProjects);
    }
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  saveToStorage() {
    localStorage.setItem('projects', JSON.stringify(this.projects));
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  getProjects() {
    return this.projects;
  }

  getProject(id) {
    return this.projects.find(p => p.id === id);
  }

  getTasks(projectId = null) {
    if (projectId) {
      return this.tasks.filter(t => t.projectId === projectId);
    }
    return this.tasks;
  }

  getTask(id) {
    return this.tasks.find(t => t.id === id);
  }

  getDependencies(projectId = null) {
    if (projectId) {
      const projectTasks = this.getTasks(projectId);
      const taskIds = projectTasks.map(t => t.id);
      return this.dependencies.filter(d => 
        taskIds.includes(d.parentTaskId) || taskIds.includes(d.childTaskId)
      );
    }
    return this.dependencies;
  }

  updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
      this.saveToStorage();
      return this.tasks[taskIndex];
    }
    return null;
  }

  addProject(project) {
    this.projects.unshift(project);
    this.saveToStorage();
  }

  deleteProject(projectId) {
    this.projects = this.projects.filter(p => p.id !== projectId);
    this.tasks = this.tasks.filter(t => t.projectId !== projectId);
    this.saveToStorage();
  }
}

// Initialize app state
const appState = new AppState();

// Navigation helper
function navigateTo(page, params = {}) {
  let url = page;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += '?' + queryString;
  }
  window.location.href = url;
}

// Render navigation bar (common across pages)
function renderNavBar(user) {
  const nav = document.querySelector('nav');
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-logo" onclick="navigateTo('dashboard.html')">
      <div class="nav-logo-icon">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <span class="nav-logo-text">Backward.AI</span>
    </div>
    
    <div class="nav-actions">
      <div class="hidden md:flex items-center space-x-1">
        <button onclick="navigateTo('dashboard.html')" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
          Dashboard
        </button>
      </div>

      <div class="divider"></div>
      
      <div class="flex items-center space-x-4">
        <div class="nav-user-info">
          <p class="nav-user-role">${escapeHtml(user.role)}</p>
          <p class="nav-user-name">${escapeHtml(user.name)}</p>
        </div>
        <button onclick="logout()" class="btn-icon" title="Logout">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  `;
}