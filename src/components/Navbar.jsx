import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Navbar.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

// Format phone number (assumes Kenyan format, e.g., +254123456789)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  const match = phoneNumber.match(/^\+254(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
};

function Navbar({ user, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout');
      setUser(false);
      navigate('/signin');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to log out. Please try again.');
    }
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${sidebarOpen ? 'navbar--open' : 'navbar--closed'}`}>
        <div className="navbar__header">
          <button
            className="navbar__hamburger"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link to="/dashboard" className="navbar__logo" onClick={closeSidebar}>
            <img src="/logo192.png" alt="Jishinde M.H.S. Logo" className="navbar__logo-image" />
            {sidebarOpen && <span className="navbar__logo-text">Jishinde M.H.S.</span>}
          </Link>
        </div>
        <div className="navbar__links">
          {user ? (
            <>
              <span className="navbar__welcome">
                {sidebarOpen ? `Welcome, ${user.first_name} (${formatPhoneNumber(user.phone_number)})` : 'Welcome'}
              </span>
              <Link to="/dashboard" className="navbar__link" onClick={closeSidebar}>
                <span className="navbar__link-icon">🏠</span>
                {sidebarOpen && 'Dashboard'}
              </Link>
              <Link to="/book-bus" className="navbar__link" onClick={closeSidebar}>
                <span className="navbar__link-icon">🚌</span>
                {sidebarOpen && 'Book Bus'}
              </Link>
              <Link to="/my-bookings" className="navbar__link" onClick={closeSidebar}>
                <span className="navbar__link-icon">📋</span>
                {sidebarOpen && 'My Bookings'}
              </Link>
              <Link to="/profile" className="navbar__link" onClick={closeSidebar}>
                <span className="navbar__link-icon">👤</span>
                {sidebarOpen && 'Profile'}
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/all-bookings" className="navbar__link" onClick={closeSidebar}>
                    <span className="navbar__link-icon">📊</span>
                    {sidebarOpen && 'All Bookings'}
                  </Link>
                  <Link to="/admin-panel" className="navbar__link" onClick={closeSidebar}>
                    <span className="navbar__link-icon">⚙️</span>
                    {sidebarOpen && 'Admin Panel'}
                  </Link>
                  <Link to="/add-bus" className="navbar__link" onClick={closeSidebar}>
                    <span className="navbar__link-icon">➕</span>
                    {sidebarOpen && 'Add Bus'}
                  </Link>
                  <Link to="/manage-teachers" className="navbar__link" onClick={closeSidebar}>
                    <span className="navbar__link-icon">👥</span>
                    {sidebarOpen && 'Manage Teachers'}
                  </Link>
                </>
              )}
              <button className="navbar__logout" onClick={handleLogout}>
                <span className="navbar__link-icon">🚪</span>
                {sidebarOpen && 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="navbar__link" onClick={closeSidebar}>
                <span className="navbar__link-icon">🔐</span>
                {sidebarOpen && 'Sign In'}
              </Link>
              <Link to="/signup" className="navbar__link" onClick={closeSidebar}>
                <span className="navbar__link-icon">✍️</span>
                {sidebarOpen && 'Sign Up'}
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;