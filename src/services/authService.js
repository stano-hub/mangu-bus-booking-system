import axiosInstance from '../services/api/axiosInstance';

const authService = {
  // Sign up a new teacher/admin
  signup: async (data) => {
    try {
      const res = await axiosInstance.post('/api/auth/register', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data; // { success, user, token }
    } catch (err) {
      throw err.response?.data || { message: 'Signup failed' };
    }
  },

  // Sign in existing teacher/admin (supports teacherId OR email)
  signin: async (data) => {
    try {
      // Backend accepts either teacherId or email
      const loginData = data.teacherId 
        ? { teacherId: data.teacherId, password: data.password }
        : { email: data.email, password: data.password };
      
      const res = await axiosInstance.post('/api/auth/login', loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data; // { success, user, token }
    } catch (err) {
      throw err.response?.data || { message: 'Signin failed' };
    }
  },

  // Logout current user
  logout: async () => {
    try {
      await axiosInstance.post('/api/auth/logout'); // No data expected
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { message: 'Logged out successfully' };
    } catch (err) {
      localStorage.removeItem('token'); // Clear anyway
      localStorage.removeItem('user');
      throw err.response?.data || { message: 'Logout failed' };
    }
  },

  // Get current logged-in user profile
  getProfile: async () => {
    try {
      const res = await axiosInstance.get('/api/profile');
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user)); // Sync local
      }
      return res.data; // { success, user }
    } catch (err) {
      throw err.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update current logged-in user profile
  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put('/api/profile', data);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res.data; // { success, message, user }
    } catch (err) {
      throw err.response?.data || { message: 'Failed to update profile' };
    }
  },
};

export default authService;