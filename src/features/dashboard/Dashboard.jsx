import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import bookingService from '../../services/bookingService';
import './dashboard.css';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: [],
    teachersCount: 0,
    busesCount: 0,
    bookingsCount: 0
  });

  // Track mouse position for face animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Reset success animation
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user.role === 'admin') {
          const [statsData, bookingsData] = await Promise.all([
            dashboardService.getAdminDashboard(),
            bookingService.getMyBookings() // Use getMyBookings for admin's own bookings
          ]);
          console.log('Admin stats:', statsData, 'Bookings:', bookingsData);
          setStats({
            teachersCount: statsData.teachersCount || 0,
            busesCount: statsData.busesCount || 0,
            bookingsCount: statsData.bookingsCount || 0,
            upcomingBookings: (bookingsData || []).filter(b => new Date(b.travelDate) > new Date())
          });
        } else {
          const bookingsData = await bookingService.getMyBookings(); // Use getMyBookings for teachers
          console.log('Teacher bookings:', bookingsData);
          setStats({
            totalBookings: bookingsData.length || 0,
            upcomingBookings: (bookingsData || []).filter(b => new Date(b.travelDate) > new Date())
          });
        }
        setIsSuccess(true);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboard();
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard" data-success={isSuccess}>
        <div className="auth-face">
          <div className="face-eyes">
            <div
              className="eye left"
              style={{
                transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 10}px, ${(mousePos.y / window.innerHeight - 0.5) * 10}px)`
              }}
            ></div>
            <div
              className="eye right"
              style={{
                transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 10}px, ${(mousePos.y / window.innerHeight - 0.5) * 10}px)`
              }}
            ></div>
          </div>
          <div className="face-mouth"></div>
        </div>
        <h2 className="dashboard__title">Welcome, {user?.name || 'User'} 👋</h2>
        {error && <p className="dashboard__error">{error}</p>}
        {loading ? (
          <div className="dashboard__loading">
            <span className="dashboard__spinner"></span>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="dashboard__stats">
              {user.role === 'admin' ? (
                <>
                  <div className="dashboard__stat-card">
                    <h3>Teachers</h3>
                    <p>{stats.teachersCount}</p>
                  </div>
                  <div className="dashboard__stat-card">
                    <h3>Buses</h3>
                    <p>{stats.busesCount}</p>
                  </div>
                  <div className="dashboard__stat-card">
                    <h3>Bookings</h3>
                    <p>{stats.bookingsCount}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="dashboard__stat-card">
                    <h3>Total Bookings</h3>
                    <p>{stats.totalBookings}</p>
                  </div>
                  <div className="dashboard__stat-card">
                    <h3>Upcoming Trips</h3>
                    <p>{stats.upcomingBookings.length}</p>
                  </div>
                </>
              )}
              <button
                className="dashboard__book-btn"
                onClick={() => navigate('/book-bus')}
                aria-label="Book a bus"
              >
                Book a Bus 🚌
              </button>
            </div>
            <div className="dashboard__bookings">
              <h3>Upcoming Bookings</h3>
              {stats.upcomingBookings.length === 0 ? (
                <p className="dashboard__empty">No upcoming bookings 🚌</p>
              ) : (
                <div className="dashboard__cards">
                  {stats.upcomingBookings.map((b) => (
                    <div key={b._id} className="dashboard__card">
                      <h4>{b.bus?.registrationNumber || 'N/A'}</h4>
                      <p>Description: {b.bus?.description || 'N/A'}</p>
                      <p>Date: {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}</p>
                      <p>Seats: {b.bus?.capacity || 'N/A'}</p>
                      <p>Purpose: {b.purpose || 'N/A'}</p>
                      <p>Status: <span className={`status-badge status-${b.status?.toLowerCase() || 'active'}`}>{b.status || 'Active'}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 