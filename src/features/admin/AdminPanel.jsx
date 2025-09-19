import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import './admin.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalBuses: 0,
    totalTeachers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getAdminDashboard();
      console.log('AdminPanel stats:', data);
      setStats({
        totalBookings: data.bookingsCount || 0,
        totalBuses: data.busesCount || 0,
        totalTeachers: data.teachersCount || 0
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="admin-loading" role="status">
      <div className="spinner"></div>
      <p>Loading stats...</p>
    </div>
  );
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div className="admin-panel" role="region" aria-label="Admin Dashboard">
      <h2>Admin Dashboard</h2>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Buses</h3>
          <p>{stats.totalBuses}</p>
        </div>
        <div className="stat-card">
          <h3>Total Teachers</h3>
          <p>{stats.totalTeachers}</p>
        </div>
      </div>
      <div className="admin-actions">
        <button
          onClick={() => navigate('/add-bus')}
          aria-label="Add a new bus"
        >
          Add Bus
        </button>
        <button
          onClick={() => navigate('/manage-teachers')}
          aria-label="Manage teachers"
        >
          Manage Teachers
        </button>
        <button
          onClick={() => navigate('/all-bookings')}
          aria-label="View all bookings"
        >
          View All Bookings
        </button>
        <button
          onClick={fetchStats}
          aria-label="Refresh dashboard stats"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;