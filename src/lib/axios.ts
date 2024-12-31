import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Try getting token from localStorage first
    let token = localStorage.getItem('token');
    
    // If no token in localStorage, try getting from store
    if (!token) {
      const authStore = useAuthStore.getState();
      token = authStore.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle connection errors
    if (!error.response) {
      window.dispatchEvent(new CustomEvent('api:connection-error', {
        detail: {
          message: 'Unable to connect to server. Please check your internet connection.'
        }
      }));
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear auth state on 401
      localStorage.removeItem('token');
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
