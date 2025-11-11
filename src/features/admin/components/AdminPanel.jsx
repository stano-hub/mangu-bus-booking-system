import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import dashboardService from '../../../services/dashboardService';
import Loader from '../../../components/layout/Loader';
import '../admin.css'; // Co-located CSS

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    bookingsCount: 0,
    busesCount: 0,
    teachersCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!user || user.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await dashboardService.getDashboard('admin', user._id);
      setStats({
        bookingsCount: data.bookingsCount || 0,
        busesCount: data.busesCount || 0,
        teachersCount: data.teachersCount || 0
      });
    } catch (err) {
      // Handle 403 or other errors gracefully - show message, don't redirect
      const errorMsg = err.error || err.message || 'Failed to load dashboard stats';
      if (err.status === 403) {
        setError('Access denied. You do not have permission to view this page.');
      } else if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {error && (
        <div className="error-message" style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          <p>{error}</p>
          <button 
            onClick={fetchStats} 
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="admin-stats">
        <div className="stat-card">
          <h2>Total Bookings</h2>
          <p>{stats.bookingsCount}</p>
        </div>
        <div className="stat-card">
          <h2>Total Buses</h2>
          <p>{stats.busesCount}</p>
        </div>
        <div className="stat-card">
          <h2>Total Teachers</h2>
          <p>{stats.teachersCount}</p>
        </div>
      </div>
      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="buttons">
          <button onClick={() => navigate('/admin/manage-buses')}>
            Manage Buses
          </button>
          <button onClick={() => navigate('/admin/manage-teachers')}>
            Manage Teachers
          </button>
          <button onClick={() => navigate('/admin/all-bookings')}>
            View All Bookings
          </button>
          <button onClick={fetchStats} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;