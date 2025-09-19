import axios from 'axios';

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const axiosInstance = axios.create({
  baseURL: isDev
    ? 'http://localhost:5000' // 🖥 local dev
    : 'https://mangu-bus-booking-system-backend.onrender.com', // ☁️ production
  withCredentials: false, // Disable cookies, use JWT headers
});

// Add request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;