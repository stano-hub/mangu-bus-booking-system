// src/services/api/axiosInstance.js
import axios from 'axios';
import { getNetworkStatus, isSlowConnection, shouldOptimizeForBandwidth } from '../../utils/networkUtils';

const baseFromEnv = process.env.REACT_APP_API_BASE_URL;
const baseURL = baseFromEnv && baseFromEnv.trim()
  ? baseFromEnv.trim()
  : 'http://localhost:5000';

if (!baseFromEnv && process.env.NODE_ENV === 'development') {
  console.warn('[axios] REACT_APP_API_BASE_URL not set. Falling back to http://localhost:5000');
}

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && !config.url.includes('/api/auth/login') && !config.url.includes('/api/auth/register')) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (isSlowConnection() || shouldOptimizeForBandwidth()) {
        config.headers['X-Client-Optimized'] = 'true';
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  const MAX_RETRIES = 2;

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        const retryCount = originalRequest._retryCount || 0;
        
        const isIdempotent = ['get', 'head', 'options'].includes(originalRequest.method?.toLowerCase());
        
        if (retryCount < MAX_RETRIES && isIdempotent) {
          originalRequest._retryCount = retryCount + 1;
          originalRequest.timeout = 30000 + (originalRequest._retryCount * 15000);
          
          console.log(`Request timed out. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return instance(originalRequest);
        }
        
        return Promise.reject({
          error: 'Server is taking too long. Please try again.',
          status: 408,
          data: error.response?.data,
        });
      }

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      const errorData = error.response?.data || {};
      let errorMessage = errorData.error || errorData.message || error.message || 'An error occurred';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The server is waking up. Please try again.';
      }

      return Promise.reject({
        error: errorMessage,
        status: error.response?.status,
        data: errorData,
      });
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export const apiWithOfflineSupport = async (config) => {
  const networkStatus = getNetworkStatus();
  
  if (networkStatus === 'offline') {
    return Promise.reject({
      error: 'You are offline. Please check your connection.',
      status: 0,
      offline: true,
    });
  }
  
  return axiosInstance(config);
};

export default axiosInstance;
