// Authentication Module

const AUTH_KEY = 'backward_analytics_user';

// Check if user is logged in
function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) !== null;
}

// Get current user
function getCurrentUser() {
  const userJson = localStorage.getItem(AUTH_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// Login user
function login(email, password, role) {
  // Simulate authentication (in real app, this would call an API)
  const user = {
    id: generateId(),
    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    email: email,
    role: role,
    department: 'Engineering'
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

// Logout user
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

// Check authentication and redirect if needed
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Check if user is viewer
function isViewer() {
  const user = getCurrentUser();
  return user && user.role === Role.VIEWER;
}