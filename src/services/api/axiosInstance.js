// src/services/api/axiosInstance.js
import axios from 'axios';

// Resolve API base URL from environment (.env for CRA must use REACT_APP_ prefix)
const baseFromEnv = process.env.REACT_APP_API_BASE_URL;
const baseURL = baseFromEnv && baseFromEnv.trim()
  ? baseFromEnv.trim()
  : 'http://localhost:5000';

if (!baseFromEnv && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.warn('[axios] REACT_APP_API_BASE_URL not set. Falling back to http://localhost:5000');
}

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Enable cookies for session auth
  timeout: 15000, // 15s timeout for Render cold starts
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (
      token &&
      !config.url.includes('/api/auth/login') &&
      !config.url.includes('/api/auth/register')
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors, don't redirect - let components handle errors
    if (error.response?.status === 401) {
      // Unauthorized - token invalid or expired
      const token = localStorage.getItem('token');
      if (token) {
        // Token exists but invalid - clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Extract error message from response
    const errorData = error.response?.data || {};
    const errorMessage = errorData.error || errorData.message || error.message || 'An error occurred';
    
    return Promise.reject({
      error: errorMessage,
      status: error.response?.status,
      data: errorData
    });
  }
);

export default axiosInstance;
