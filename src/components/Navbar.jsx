import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import logo from '../assets/logo.jpeg';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
      navigate('/signin');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // For touch devices
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? '✕' : '☰'}
      </button>
      <nav
        className={`sidebar ${isOpen ? 'open' : ''}`}
        ref={sidebarRef}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-logo" onClick={() => setIsOpen(false)}>
            <img src={logo} alt="Mang'u Bus Booking Logo" />
          </NavLink>
        </div>
        <ul className="sidebar-links">
          <li>
            <NavLink
              to="/dashboard"
              aria-label="Go to dashboard"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/my-bookings"
              aria-label="View my bookings"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setIsOpen(false)}
            >
              My Bookings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              aria-label="View profile"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setIsOpen(false)}
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/book-bus"
              aria-label="Book a bus"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setIsOpen(false)}
            >
              Book a Bus
            </NavLink>
          </li>
          {user?.role === 'admin' && (
            <>
              <li>
                <NavLink
                  to="/all-bookings"
                  aria-label="View all bookings"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsOpen(false)}
                >
                  All Bookings
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin-panel"
                  aria-label="Go to admin panel"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsOpen(false)}
                >
                  Admin Panel
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/add-bus"
                  aria-label="Add a new bus"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsOpen(false)}
                >
                  Add Bus
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manage-teachers"
                  aria-label="Manage teachers"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setIsOpen(false)}
                >
                  Manage Teachers
                </NavLink>
              </li>
            </>
          )}
          <li>
            <button
              className="logout-btn"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              aria-label="Log out"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;