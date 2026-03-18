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
  timeout: 120000, // 120s timeout — Render free tier cold starts can take 50-90s
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

// Maximum number of automatic retries for timeout errors
const MAX_RETRIES = 2;

// Add response interceptor for error handling and retry logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Retry logic for timeout errors (up to MAX_RETRIES)
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        
        // Increase timeout progressively: 120s → 150s → 180s
        originalRequest.timeout = 120000 + (originalRequest._retryCount * 30000);
        
        console.log(
          `Request timed out. Retrying (attempt ${originalRequest._retryCount}/${MAX_RETRIES}) ` +
          `with ${originalRequest.timeout / 1000}s timeout...`
        );
        
        // Brief delay before retry to let server wake up
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return axiosInstance(originalRequest);
      }
    }
    
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
    let errorMessage = errorData.error || errorData.message || error.message || 'An error occurred';
    
    // Provide a user-friendly message for timeout errors
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      errorMessage = 'The server is waking up from sleep. Please try again in a few seconds.';
    }
    
    return Promise.reject({
      error: errorMessage,
      status: error.response?.status,
      data: errorData
    });
  }
);

export default axiosInstance;
