
import React from 'react';
import { Project, Task, TaskStatus, User, Role } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  user: User;
  projects: Project[];
  tasks: Task[];
  onSelectProject: (id: string) => void;
  onAnalyzeProject: (id: string) => void;
  onCreateProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, projects, tasks, onSelectProject, onAnalyzeProject, onCreateProject }) => {
  const delayedProjects = projects.filter(p => p.status === 'Delayed');
  const overdueTasksCount = tasks.filter(t => t.status === TaskStatus.OVERDUE).length;
  const isViewer = user.role === Role.VIEWER;

  const delayReasons = tasks
    .filter(t => t.delayReasonCategory && t.delayReasonCategory !== 'None')
    .reduce((acc: any[], task) => {
      const existing = acc.find(a => a.name === task.delayReasonCategory);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: task.delayReasonCategory, value: 1 });
      }
      return acc;
    }, []);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio Health</h1>
          <p className="text-slate-500 mt-1">Global summary of project execution and root cause trends.</p>
        </div>
        {!isViewer && (
          <button 
            onClick={onCreateProject}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transform transition active:scale-95 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Project</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Projects</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-slate-900">{projects.length}</span>
            <span className="text-slate-400 text-sm font-medium">Tracking</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-red-200 transition">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Delayed Projects</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-red-600">{delayedProjects.length}</span>
            <span className="text-slate-400 text-sm font-medium">Slipped</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-amber-200 transition">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Overdue Tasks</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-4xl font-black text-amber-600">{overdueTasksCount}</span>
            <span className="text-slate-400 text-sm font-medium">Blocked</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-bold text-lg text-slate-800">Project Registry</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {projects.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">No projects created yet.</div>
            ) : projects.map(p => (
              <div key={p.id} className="p-6 hover:bg-slate-50 transition flex justify-between items-center group">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition">{p.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.status === 'Delayed' ? 'bg-red-100 text-red-700' : 
                      p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      Goal: {p.plannedEndDate}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span>{tasks.filter(t => t.projectId === p.id).length} Tasks</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onSelectProject(p.id)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                  >
                    Details
                  </button>
                  {p.status === 'Delayed' && (
                    <button 
                      onClick={() => onAnalyzeProject(p.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-md transition"
                    >
                      Analyze
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col">
          <h2 className="font-bold text-lg text-slate-800 mb-2">Delay Attribution</h2>
          <p className="text-sm text-slate-400 mb-8">Aggregated root causes across all delayed projects.</p>
          <div className="flex-1 min-h-[250px] relative">
            {delayReasons.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={delayReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {delayReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <p className="text-slate-400 italic text-sm">No delay data captured.</p>
              </div>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {delayReasons.map((r, i) => (
              <div key={r.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-600 truncate">{r.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
