// src/utils/auth.js

// Helper function to check if user has specific role
export const hasRole = (requiredRole) => {
  const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  return userRoles.includes(requiredRole);
};

// You can add other auth-related functions here too
export const isLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const getUserRoles = () => {
  return JSON.parse(localStorage.getItem('userRoles') || '[]');
};