import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminPanel.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

function AdminPanel() {
  const [stats, setStats] = useState({
    bookingsCount: 0,
    teachersCount: 0,
    busesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, teachersRes, busesRes] = await Promise.all([
          axiosInstance.get('/api/bookings'),
          axiosInstance.get('/admin/teachers'),
          axiosInstance.get('/api/buses')
        ]);

        setStats({
          bookingsCount: bookingsRes.data.length,
          teachersCount: teachersRes.data.length,
          busesCount: busesRes.data.length
        });
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel__loading">
        <div className="admin-panel__spinner"></div>
      </div>
    );
  }

  if (error) {
    return <p className="admin-panel__error">{error}</p>;
  }

  return (
    <div className="admin-panel">
      <h1 className="admin-panel__title">Admin Dashboard</h1>
      <div className="admin-panel__stats">
        <div className="admin-panel__card">
          <h2 className="admin-panel__card-title">Total Bookings</h2>
          <p className="admin-panel__card-value">{stats.bookingsCount}</p>
        </div>
        <div className="admin-panel__card">
          <h2 className="admin-panel__card-title">Total Teachers</h2>
          <p className="admin-panel__card-value">{stats.teachersCount}</p>
        </div>
        <div className="admin-panel__card">
          <h2 className="admin-panel__card-title">Total Buses</h2>
          <p className="admin-panel__card-value">{stats.busesCount}</p>
        </div>
      </div>
      <div className="admin-panel__links">
        <Link to="/manage-teachers" className="admin-panel__link admin-panel__link--teachers">
          Manage Teachers
        </Link>
        <Link to="/add-bus" className="admin-panel__link admin-panel__link--add-bus">
          Add Bus
        </Link>
        <Link to="/all-bookings" className="admin-panel__link admin-panel__link--bookings">
          View All Bookings
        </Link>
      </div>
    </div>
  );
}

export default AdminPanel;