// src/utils/auth.js

// Helper function to check if user has specific role
export const hasRole = (requiredRole) => {
  const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  return userRoles.includes(requiredRole);
};

// You can add other auth-related functions here too
export const isLoggedIn = () => {
  return isAuthenticated();
};

export const getUserRoles = () => {
  return JSON.parse(localStorage.getItem('userRoles') || '[]');
};

export const clearSession = () => {
  ['token', 'userRoles', 'userEmail', 'fullName', 'username', 'isLoggedIn']
    .forEach(key => localStorage.removeItem(key));
};

export const isTokenValid = (token = localStorage.getItem('token')) => {
  if (!token) return false;
  try {
    const payloadPart = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payloadPart.padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload));
    return !payload.exp || payload.exp * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
};

export const isAuthenticated = () => {
  const valid = localStorage.getItem('isLoggedIn') === 'true' && isTokenValid();
  if (!valid) clearSession();
  return valid;
};
