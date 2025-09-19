import axiosInstance from '../api/axiosInstance';

const authService = {
  // Sign up a new teacher/admin
  signup: async (data) => {
    try {
      const res = await axiosInstance.post('/api/auth/register', data);
      return res.data; // { user, token, message }
    } catch (err) {
      throw err.response?.data || { message: 'Signup failed' };
    }
  },

  // Sign in existing teacher/admin
  signin: async (data) => {
    try {
      const res = await axiosInstance.post('/api/auth/login', data);
      return res.data; // { user, token, message }
    } catch (err) {
      throw err.response?.data || { message: 'Signin failed' };
    }
  },

  // Logout current user
  logout: async () => {
    try {
      const res = await axiosInstance.post('/api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return res.data; // { message: 'Logged out successfully' }
    } catch (err) {
      throw err.response?.data || { message: 'Logout failed' };
    }
  },

  // Get current logged-in user profile
  getProfile: async () => {
    try {
      const res = await axiosInstance.get('/api/auth/profile');
      return res.data; // { user: { id, name, email, phone, role } }
    } catch (err) {
      throw err.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update current logged-in user profile
  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put('/api/auth/profile', data);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user)); // Keep profile fresh
      }
      return res.data; // { user, message }
    } catch (err) {
      throw err.response?.data || { message: 'Failed to update profile' };
    }
  },
};

export default authService;