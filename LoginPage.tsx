
import React, { useState } from 'react';
import { Role, User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('manager@company.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<Role>(Role.MANAGER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email,
      role,
      department: 'Engineering'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        <div className="bg-blue-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Backward Analytics</h1>
          <p className="text-blue-100 text-sm mt-1">Root Cause Analysis System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input 
                type="email" 
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input 
                type="password" 
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Access Role</label>
              <select 
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value={Role.ADMIN}>Administrator</option>
                <option value={Role.MANAGER}>Department Manager</option>
                <option value={Role.VIEWER}>Read-only Viewer</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all shadow-lg active:scale-95"
          >
            Sign In to Dashboard
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-slate-400 hover:text-blue-500 transition">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
