
import React, { useState } from 'react';
import { Project, Task, TaskDependency, TaskStatus, DelayReasonCategory, User, Role } from '../types';

interface ProjectDetailProps {
  user: User;
  project: Project;
  tasks: Task[];
  dependencies: TaskDependency[];
  onBack: () => void;
  onUpdateTask: (task: Task) => void;
  onAnalyze: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  user, project, tasks, dependencies, onBack, onUpdateTask, onAnalyze 
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [delayReason, setDelayReason] = useState<DelayReasonCategory>(DelayReasonCategory.NONE);
  const [delayNote, setDelayNote] = useState('');

  const isDelayed = project.status === 'Delayed';
  const isViewer = user.role === Role.VIEWER;

  const handleOpenComplete = (task: Task) => {
    if (isViewer) return;
    setSelectedTask(task);
    setShowCompleteModal(true);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setDelayReason(DelayReasonCategory.NONE);
    setDelayNote('');
  };

  const submitCompletion = () => {
    if (!selectedTask || isViewer) return;

    const plannedDate = new Date(selectedTask.plannedEndDate);
    const actualDate = new Date(completionDate);
    const isLate = actualDate > plannedDate;

    if (isLate && delayReason === DelayReasonCategory.NONE) {
      alert("Please select a reason for the delay.");
      return;
    }

    const updatedTask: Task = {
      ...selectedTask,
      status: TaskStatus.COMPLETED,
      actualEndDate: completionDate,
      delayReasonCategory: isLate ? delayReason : DelayReasonCategory.NONE,
      delayReasonNote: isLate ? delayNote : undefined
    };

    onUpdateTask(updatedTask);
    setShowCompleteModal(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                project.status === 'Delayed' ? 'bg-red-100 text-red-700' : 
                project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Project ID: {project.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {isDelayed && (
            <button 
              onClick={onAnalyze}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              Backward Root Cause Analysis
            </button>
          )}
          {!isViewer && (
            <button className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium shadow-sm transition">
              Add Task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Task Dependency Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-100 min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Planned End</th>
                    {!isViewer && <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{task.name}</div>
                        <div className="text-xs text-slate-400">
                          Depends on: {dependencies.filter(d => d.childTaskId === task.id).map(d => {
                            const parent = tasks.find(t => t.id === d.parentTaskId);
                            return parent ? parent.name : 'Unknown';
                          }).join(', ') || 'None'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{task.assignedDept}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                          task.status === TaskStatus.OVERDUE ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{task.plannedEndDate}</td>
                      {!isViewer && (
                        <td className="px-4 py-4 text-sm font-medium">
                          {task.status !== TaskStatus.COMPLETED ? (
                            <button 
                              onClick={() => handleOpenComplete(task)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Mark Complete
                            </button>
                          ) : (
                            <span className="text-slate-300">Done</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Project Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</p>
                <p className="text-sm text-slate-600 mt-1">{project.description}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planned End</p>
                  <p className="text-sm font-bold text-slate-800">{project.plannedEndDate}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actual End</p>
                  <p className={`text-sm font-bold ${project.status === 'Delayed' ? 'text-red-600' : 'text-green-600'}`}>
                    {project.actualEndDate || 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="font-bold text-lg mb-4">Efficiency Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Task Completion Rate</span>
                <span className="font-black text-blue-600">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500" 
                  style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                {tasks.filter(t => t.status === TaskStatus.COMPLETED).length} of {tasks.length} sub-tasks finalized
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && !isViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Complete Task: {selectedTask?.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Actual Completion Date</label>
                <input 
                  type="date" 
                  className="mt-1 block w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
              </div>

              {new Date(completionDate) > new Date(selectedTask?.plannedEndDate || '') && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg animate-fadeIn">
                  <p className="text-amber-800 text-sm font-semibold mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Root Cause Tracking: Reason for Delay?
                  </p>
                  <select 
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value as DelayReasonCategory)}
                  >
                    <option value={DelayReasonCategory.NONE}>Select a reason...</option>
                    <option value={DelayReasonCategory.APPROVAL}>Approval Delay</option>
                    <option value={DelayReasonCategory.RESOURCE}>Resource Unavailable</option>
                    <option value={DelayReasonCategory.TECHNICAL}>Technical Difficulty</option>
                    <option value={DelayReasonCategory.SCOPE}>Scope Change</option>
                    <option value={DelayReasonCategory.DEPENDENCY}>Dependency Failure</option>
                  </select>
                  <textarea 
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-3 h-20 placeholder:text-slate-400"
                    placeholder="Provide specific details about the root cause..."
                    value={delayNote}
                    onChange={(e) => setDelayNote(e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={submitCompletion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
              >
                Save Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
