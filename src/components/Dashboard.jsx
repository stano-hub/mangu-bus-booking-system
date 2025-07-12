import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

// Format phone number (assumes Kenyan format, e.g., +254123456789)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  const match = phoneNumber.match(/^\+254(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber; // Return raw if format doesn't match
};

function Dashboard({ user }) {
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let lastUpdate = 0;
    const throttleDelay = 16; // ~60fps

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastUpdate >= throttleDelay) {
        setMousePos({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!user) {
    return <p className="dashboard__error">No user data available. Please log in.</p>;
  }

  return (
    <div className="dashboard">
      {/* Floating ball animation */}
      <div
        className="dashboard__ball"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`
        }}
      />
      <h2 className="dashboard__title">Teacher Dashboard</h2>
      {error && <p className="dashboard__error">{error}</p>}
      <div className="dashboard__content">
        <div className="dashboard__profile">
          <h3 className="dashboard__greeting">
            Welcome, {user.first_name} {user.last_name}
          </h3>
          <p>
            <strong>Teacher ID:</strong> {user.teacher_id}
          </p>
          <p>
            <strong>Email:</strong> {user.email || 'N/A'}
          </p>
          <p>
            <strong>Phone Number:</strong> {formatPhoneNumber(user.phone_number)}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
        <div className="dashboard__options">
          <Link to="/book-bus" className="dashboard__option-card">
            <h4>Book a Bus</h4>
            <p>Reserve a bus for your trip.</p>
          </Link>
          <Link to="/my-bookings" className="dashboard__option-card">
            <h4>My Bookings</h4>
            <p>View your upcoming and past bookings.</p>
          </Link>
          {user.role === 'admin' && (
            <>
              <Link to="/all-bookings" className="dashboard__option-card">
                <h4>All Bookings</h4>
                <p>View all bookings in the system.</p>
              </Link>
              <Link to="/admin-panel" className="dashboard__option-card">
                <h4>Admin Panel</h4>
                <p>Manage buses and teachers.</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;