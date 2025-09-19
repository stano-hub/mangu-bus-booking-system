import axiosInstance from '../api/axiosInstance';

const dashboardService = {
  getTeacherDashboard: async () => {
    try {
      const res = await axiosInstance.get('/api/teacher/stats');
      console.log('Raw teacher stats:', res.data);
      return res.data; // { totalBookings, upcomingBookings: [...] }
    } catch (err) {
      throw err.response?.data || { message: 'Failed to fetch teacher dashboard' };
    }
  },

  getAdminDashboard: async () => {
    try {
      const res = await axiosInstance.get('/api/admin/stats');
      console.log('Raw admin stats:', res.data);
      return res.data; // { teachersCount, busesCount, bookingsCount }
    } catch (err) {
      throw err.response?.data || { message: 'Failed to fetch admin dashboard' };
    }
  }
};

export default dashboardService;