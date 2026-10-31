import axios from 'axios';
import { clearSession } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Keep if you use cookies, harmless otherwise
});

// Automatically attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      clearSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login?reason=session-expired');
      }
    }
    return Promise.reject(error);
  }
);
