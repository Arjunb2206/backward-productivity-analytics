
import React, { useMemo, useState } from 'react';
import { Project, Task, TaskDependency, DelayTraceNode, AIRecoveryPlan } from '../types';
import { performBackwardAnalysis } from '../services/analysisEngine';
import { GoogleGenAI } from "@google/genai";

interface AnalysisViewProps {
  project: Project;
  tasks: Task[];
  dependencies: TaskDependency[];
  onBack: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ project, tasks, dependencies, onBack }) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIRecoveryPlan | null>(null);

  const trace = useMemo(() => 
    performBackwardAnalysis(project, tasks, dependencies), 
    [project, tasks, dependencies]
  );

  const rootCause = trace.find(t => t.isRootCause);
  const totalDelayDays = Math.ceil(
    (new Date(project.actualEndDate!).getTime() - new Date(project.plannedEndDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  const generateAIRecoveryPlan = async () => {
    if (!rootCause) return;
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As a senior project management consultant, analyze this project delay and provide a recovery plan.
        Project: ${project.name}
        Total Delay: ${totalDelayDays} days
        Root Cause Task: ${rootCause.task.name}
        Root Cause Department: ${rootCause.task.assignedDept}
        Root Cause Reason: ${rootCause.task.delayReasonCategory}
        Manager Note: ${rootCause.task.delayReasonNote}

        Please return a JSON response with the following structure:
        {
          "analysis": "A brief executive summary of what went wrong",
          "steps": ["Step 1", "Step 2", "Step 3"],
          "riskMitigation": "How to prevent this in future similar projects"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setAiPlan(data);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-3 rounded-xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Root Cause Analysis</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Tracing the {totalDelayDays}-day slippage of {project.name}.</p>
          </div>
        </div>
        
        <button 
          onClick={generateAIRecoveryPlan}
          disabled={isGeneratingAI}
          className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 ${
            isGeneratingAI ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {isGeneratingAI ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          <span>{aiPlan ? 'Refresh AI Strategy' : 'Generate AI Recovery Plan'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6">
          {aiPlan && (
            <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
               </div>
               <h2 className="text-xl font-black mb-4 flex items-center tracking-tight">
                 <span className="bg-indigo-500/30 p-1.5 rounded-lg mr-3">
                   <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-1.003l-.548-.547z"/></svg>
                 </span>
                 Gemini Intelligence Recovery Plan
               </h2>
               <div className="space-y-6">
                 <div>
                   <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Executive Analysis</p>
                   <p className="text-lg font-medium leading-relaxed">{aiPlan.analysis}</p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-3">Priority Steps</p>
                      <ul className="space-y-2">
                        {aiPlan.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="text-indigo-400 font-bold mr-2">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-3">Future Guardrails</p>
                      <p className="text-sm leading-relaxed text-indigo-50">{aiPlan.riskMitigation}</p>
                    </div>
                 </div>
               </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <h2 className="font-bold text-xl text-slate-800 mb-10 flex items-center">
              <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
              The Dependency Trace Chain
            </h2>
            
            <div className="relative pl-12 space-y-12 before:absolute before:left-[1.2rem] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 before:rounded-full">
              {trace.map((node, index) => (
                <div key={node.task.id} className="relative group animate-slideRight" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute -left-[3.25rem] top-1.5 w-10 h-10 rounded-2xl border-4 border-white shadow-lg z-10 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    node.isRootCause ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
                  }`}>
                    {node.isRootCause ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>

                  <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                    node.isRootCause ? 'bg-red-50/50 border-red-200 ring-4 ring-red-100/50' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        {node.isRootCause && (
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] bg-red-100 px-3 py-1 rounded-full mb-3 inline-block">
                            Primary Failure Node
                          </span>
                        )}
                        <h3 className="font-black text-lg text-slate-900 leading-tight">{node.task.name}</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{node.task.assignedDept}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xl sm:text-2xl font-black text-red-600">+{node.delayDays}d</span>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">Variance</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Manager Attribution Note</p>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                        "{node.task.delayReasonNote || 'System-detected cascade from parent blocker.'}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
            <h2 className="text-xl font-black mb-8 border-b border-white/10 pb-4 flex items-center tracking-tight">Executive Brief</h2>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Project Slippage</p>
                <p className="text-3xl font-black text-red-400">{totalDelayDays} Days</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Original Root Cause</p>
                <p className="text-xl font-bold tracking-tight text-white">{rootCause?.task.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Responsible Dept.</p>
                <p className="text-xl font-bold tracking-tight text-blue-400">{rootCause?.task.assignedDept}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h3 className="font-black text-slate-900 mb-6 tracking-tight">System Recommendations</h3>
            <ul className="space-y-4">
              {[
                `Schedule ${rootCause?.task.assignedDept} post-mortem session.`,
                `Add ${Math.max(5, Math.ceil(totalDelayDays/2))}d buffer to '${rootCause?.task.name}' in future templates.`,
                `Investigate ${rootCause?.task.delayReasonCategory} resource allocations.`
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-[10px] font-black text-blue-600">{i + 1}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
