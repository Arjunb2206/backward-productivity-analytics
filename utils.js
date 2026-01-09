// Utility Functions

// Date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Calculate delay in days
function calculateDelayDays(plannedDate, actualDate) {
  const planned = new Date(plannedDate);
  const actual = new Date(actualDate);
  const delayMs = actual.getTime() - planned.getTime();
  return Math.ceil(delayMs / (1000 * 60 * 60 * 24));
}

// Check if date is late
function isLate(plannedDate, actualDate) {
  return new Date(actualDate) > new Date(plannedDate);
}

// Get status badge class
function getStatusBadgeClass(status) {
  const statusMap = {
    'Active': 'badge-active',
    'Completed': 'badge-completed',
    'Delayed': 'badge-delayed',
    'Pending': 'badge-pending',
    'In Progress': 'badge-in-progress',
    'Overdue': 'badge-overdue'
  };
  return statusMap[status] || 'badge-active';
}

// Create SVG icon
function createIcon(pathData, className = 'w-5 h-5') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', pathData);
  
  svg.appendChild(path);
  return svg;
}

// Show/hide element
function show(element) {
  if (element) element.style.display = 'block';
}

function hide(element) {
  if (element) element.style.display = 'none';
}

// Generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Get query parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Set query parameter
function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}