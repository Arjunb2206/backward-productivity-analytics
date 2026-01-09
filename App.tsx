
import React, { useState, useMemo } from 'react';
import { Project, Task, TaskDependency, User, Role } from './types';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_DEPENDENCIES } from './services/mockData';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import AnalysisView from './components/AnalysisView';
import LoginPage from './components/LoginPage';
import CreateProjectModal from './components/CreateProjectModal';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [dependencies] = useState<TaskDependency[]>(MOCK_DEPENDENCIES);
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'project' | 'analysis'>('dashboard');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveProjectId(null);
    setView('dashboard');
  };

  const navigateToProject = (id: string) => {
    setActiveProjectId(id);
    setView('project');
  };

  const navigateToAnalysis = (id: string) => {
    setActiveProjectId(id);
    setView('analysis');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setIsCreatingProject(false);
    navigateToProject(newProject.id);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-xl z-40 sticky top-0">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Backward.AI</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                view === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
          </div>

          <div className="h-8 w-px bg-slate-800"></div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{currentUser.role}</p>
              <p className="text-sm font-bold text-white leading-none">{currentUser.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all border border-slate-700"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        {view === 'dashboard' && (
          <Dashboard 
            user={currentUser}
            projects={projects} 
            tasks={tasks}
            onSelectProject={navigateToProject}
            onAnalyzeProject={navigateToAnalysis}
            onCreateProject={() => setIsCreatingProject(true)}
          />
        )}

        {view === 'project' && activeProject && (
          <ProjectDetail 
            user={currentUser}
            project={activeProject}
            tasks={tasks.filter(t => t.projectId === activeProject.id)}
            dependencies={dependencies}
            onBack={() => setView('dashboard')}
            onUpdateTask={handleUpdateTask}
            onAnalyze={() => setView('analysis')}
          />
        )}

        {view === 'analysis' && activeProject && (
          <AnalysisView 
            project={activeProject}
            tasks={tasks.filter(t => t.projectId === activeProject.id)}
            dependencies={dependencies}
            onBack={() => setView('project')}
          />
        )}
      </main>

      {/* Modals */}
      {isCreatingProject && (
        <CreateProjectModal 
          onClose={() => setIsCreatingProject(false)}
          onCreate={handleCreateProject}
        />
      )}

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest border-t bg-white">
        System Status: <span className="text-green-500">Live Engine Connected</span> &bull; 
        &copy; 2024 Corporate Productivity Analytics
      </footer>
    </div>
  );
};

export default App;
