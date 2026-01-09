// Analysis Page Logic and Backward Analysis Engine

let analysisProject = null;
let analysisTasks = [];
let analysisDependencies = [];
let traceNodes = [];
let aiPlan = null;

function initAnalysis() {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  renderNavBar(user);
  
  const projectId = getQueryParam('id');
  if (!projectId) {
    navigateTo('dashboard.html');
    return;
  }
  
  analysisProject = appState.getProject(projectId);
  if (!analysisProject) {
    alert('Project not found');
    navigateTo('dashboard.html');
    return;
  }
  
  analysisTasks = appState.getTasks(projectId);
  analysisDependencies = appState.getDependencies(projectId);
  
  // Perform backward analysis
  traceNodes = performBackwardAnalysis(analysisProject, analysisTasks, analysisDependencies);
  
  renderAnalysis();
}

// Backward Analysis Engine
function performBackwardAnalysis(project, tasks, dependencies) {
  if (!project.actualEndDate || new Date(project.actualEndDate) <= new Date(project.plannedEndDate)) {
    return [];
  }

  // 1. Identify all tasks that finished after the project's planned end date
  const lateTasks = tasks.filter(t => t.actualEndDate && new Date(t.actualEndDate) > new Date(project.plannedEndDate));
  
  if (lateTasks.length === 0) return [];

  // 2. Start with the absolute latest task
  let currentTask = lateTasks.reduce((prev, current) => {
    return (new Date(current.actualEndDate) > new Date(prev.actualEndDate)) ? current : prev;
  });

  const trace = [];
  const visited = new Set();

  while (currentTask && !visited.has(currentTask.id)) {
    visited.add(currentTask.id);
    
    const planned = new Date(currentTask.plannedEndDate);
    const actual = new Date(currentTask.actualEndDate);
    const delayMs = actual.getTime() - planned.getTime();
    const delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24));

    // Find dependencies of this task
    const parentDeps = dependencies.filter(d => d.childTaskId === currentTask.id);
    const parents = tasks.filter(t => parentDeps.some(d => d.parentTaskId === t.id));

    // Find the parent that finished latest (the primary blocker)
    const latestParent = parents.length > 0 
      ? parents.reduce((prev, curr) => {
          if (!prev.actualEndDate) return curr;
          if (!curr.actualEndDate) return prev;
          return new Date(curr.actualEndDate) > new Date(prev.actualEndDate) ? curr : prev;
        })
      : null;

    // A task is a root cause if it was late but its primary parent wasn't late enough
    let isRootCause = false;
    if (!latestParent) {
      isRootCause = true;
    } else if (latestParent.actualEndDate) {
       const parentEnd = new Date(latestParent.actualEndDate);
       const currentPlanned = new Date(currentTask.plannedEndDate);
       if (parentEnd <= currentPlanned && actual > currentPlanned) {
         isRootCause = true;
       }
    }

    trace.push({
      task: currentTask,
      delayDays: delayDays,
      isRootCause: isRootCause
    });

    if (isRootCause || !latestParent) break;

    currentTask = latestParent;
  }

  return trace.reverse(); // Return from Root Cause to Final Delay
}

function renderAnalysis() {
  const rootCause = traceNodes.find(t => t.isRootCause);
  const totalDelayDays = Math.ceil(
    (new Date(analysisProject.actualEndDate).getTime() - new Date(analysisProject.plannedEndDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  // Update header
  document.getElementById('projectName').textContent = analysisProject.name;
  document.getElementById('totalDelayDays').textContent = totalDelayDays;
  
  // Render trace chain
  renderTraceChain();
  
  // Render executive brief
  renderExecutiveBrief(rootCause, totalDelayDays);
  
  // Render recommendations
  renderRecommendations(rootCause, totalDelayDays);
  
  // Render AI plan if exists
  if (aiPlan) {
    renderAIPlan();
  }
}

function renderTraceChain() {
  const container = document.getElementById('traceChain');
  
  container.innerHTML = traceNodes.map((node, index) => {
    const rootClass = node.isRootCause ? 'bg-red-600 animate-pulse' : 'bg-amber-500';
    const cardClass = node.isRootCause ? 'bg-red-50/50 border-red-200 ring-4 ring-red-100/50' : 'bg-white border-slate-200';
    
    return `
      <div class="relative group animate-slideRight" style="animation-delay: ${index * 100}ms;">
        <div class="absolute -left-[3.25rem] top-1.5 w-10 h-10 rounded-2xl border-4 border-white shadow-lg z-10 flex items-center justify-center transition-transform group-hover:scale-110 ${rootClass}">
          ${node.isRootCause ? `
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ` : `
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          `}
        </div>

        <div class="p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${cardClass}">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1 mr-4">
              ${node.isRootCause ? `
                <span class="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] bg-red-100 px-3 py-1 rounded-full mb-3 inline-block">
                  Primary Failure Node
                </span>
              ` : ''}
              <h3 class="font-black text-lg text-slate-900 leading-tight">${escapeHtml(node.task.name)}</h3>
              <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">${escapeHtml(node.task.assignedDept)}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-2xl font-black text-red-600">+${node.delayDays}d</span>
              <p class="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">Variance</p>
            </div>
          </div>

          <div class="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Manager Attribution Note</p>
            <p class="text-sm text-slate-700 leading-relaxed font-medium italic">
              "${escapeHtml(node.task.delayReasonNote || 'System-detected cascade from parent blocker.')}"
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderExecutiveBrief(rootCause, totalDelayDays) {
  document.getElementById('briefDelayDays').textContent = totalDelayDays;
  document.getElementById('briefRootCause').textContent = rootCause ? rootCause.task.name : 'N/A';
  document.getElementById('briefDepartment').textContent = rootCause ? rootCause.task.assignedDept : 'N/A';
}

function renderRecommendations(rootCause, totalDelayDays) {
  if (!rootCause) return;
  
  const recommendations = [
    `Schedule ${rootCause.task.assignedDept} post-mortem session.`,
    `Add ${Math.max(5, Math.ceil(totalDelayDays/2))}d buffer to '${rootCause.task.name}' in future templates.`,
    `Investigate ${rootCause.task.delayReasonCategory} resource allocations.`
  ];
  
  const container = document.getElementById('recommendations');
  container.innerHTML = recommendations.map((item, i) => `
    <li class="flex items-start">
      <div class="w-6 h-6 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5">
        <span class="text-[10px] font-black text-blue-600">${i + 1}</span>
      </div>
      <span class="text-sm font-semibold text-slate-600 leading-tight">${escapeHtml(item)}</span>
    </li>
  `).join('');
}

function renderAIPlan() {
  if (!aiPlan) return;
  
  const container = document.getElementById('aiPlanContainer');
  container.style.display = 'block';
  container.classList.add('animate-fadeIn');
  
  document.getElementById('aiAnalysis').textContent = aiPlan.analysis;
  
  const stepsContainer = document.getElementById('aiSteps');
  stepsContainer.innerHTML = aiPlan.steps.map((step, idx) => `
    <li class="flex items-start text-sm">
      <span class="text-indigo-400 font-bold mr-2">${idx + 1}.</span>
      <span>${escapeHtml(step)}</span>
    </li>
  `).join('');
  
  document.getElementById('aiRiskMitigation').textContent = aiPlan.riskMitigation;
}

async function generateAIRecoveryPlan() {
  const rootCause = traceNodes.find(t => t.isRootCause);
  if (!rootCause) return;
  
  const totalDelayDays = Math.ceil(
    (new Date(analysisProject.actualEndDate).getTime() - new Date(analysisProject.plannedEndDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  const btn = document.getElementById('generateAIBtn');
  const btnText = document.getElementById('generateAIBtnText');
  const spinner = document.getElementById('generateAISpinner');
  
  btn.disabled = true;
  btnText.textContent = aiPlan ? 'Refresh AI Strategy' : 'Generate AI Recovery Plan';
  spinner.style.display = 'block';
  
  try {
    // Note: This would require actual Gemini API integration
    // For demo purposes, we'll simulate the response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    aiPlan = {
      analysis: `The ${totalDelayDays}-day delay in ${analysisProject.name} originated from ${rootCause.task.assignedDept}'s ${rootCause.task.name} task. The primary cause was ${rootCause.task.delayReasonCategory}, which cascaded through dependent tasks.`,
      steps: [
        'Conduct immediate stakeholder review meeting',
        'Reallocate resources to critical path tasks',
        'Implement daily standup for remaining deliverables',
        'Add buffer time to similar future projects'
      ],
      riskMitigation: 'Establish early warning system for resource constraints and implement cross-training program to reduce single points of failure.'
    };
    
    renderAIPlan();
    btnText.textContent = 'Refresh AI Strategy';
  } catch (error) {
    console.error('AI Generation failed', error);
    alert('Failed to generate AI recovery plan. Please try again.');
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

function goBack() {
  navigateTo('project-detail.html', { id: analysisProject.id });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalysis);
} else {
  initAnalysis();
}