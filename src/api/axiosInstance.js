import axios from 'axios';

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const axiosInstance = axios.create({
  baseURL: isDev
    ? 'http://localhost:5000' // 🖥 local dev
    : 'https://stano-hub-mangu-bus-booking-system.onrender.com', // ☁️ production
  withCredentials: true, // Enable cookies for session auth
  timeout: 15000, // 15s timeout for Render cold starts
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (
      token &&
      !config.url.includes('/api/auth/login') &&
      !config.url.includes('/api/auth/signup')
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
    console.error('API error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      headers: error.response?.headers
    });
    return Promise.reject(error.response?.data || { message: 'Network or CORS error' });
  }
);

export default axiosInstance;