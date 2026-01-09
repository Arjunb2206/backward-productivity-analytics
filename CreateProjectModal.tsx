
import React, { useState } from 'react';
import { Project } from '../types';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !endDate) return;

    const newProject: Project = {
      id: 'p' + Math.random().toString(36).substr(2, 4),
      name,
      description,
      plannedStartDate: startDate,
      plannedEndDate: endDate,
      status: 'Active'
    };

    onCreate(newProject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Initiate New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">Project Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Server Infrastructure Upgrade"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">Description</label>
            <textarea 
              rows={3}
              placeholder="Brief overview of project objectives..."
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">Start Date</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-1">Main Deadline</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-800 leading-relaxed">
              Once created, you can add tasks and dependencies. The system will track any deviations from the <strong>Main Deadline</strong> for future backward analysis.
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-500 font-semibold hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg active:scale-95 transition"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
