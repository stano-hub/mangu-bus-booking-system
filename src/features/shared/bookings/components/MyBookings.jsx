import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bookingService from '../../../../services/bookingService';
import '../bookings.css'; // Co-located CSS

const MyBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data.bookings || []);
      } catch (err) {
        const errorMsg = err.error || err.message || 'Failed to load bookings';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);


  if (loading) {
    return (
      <div className="bookings-container">
        <div className="my-bookings">
          <div className="my-bookings__loading">
            <span className="spinner"></span>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="my-bookings">
        <h2 className="my-bookings__title">My Bookings</h2>
        {error && <p className="my-bookings__error">{error}</p>}
        
        {bookings.length === 0 ? (
          <div className="my-bookings__empty">
            <p>No bookings found.</p>
            <button
              onClick={() => navigate('/teacher/book')}
              className="my-bookings__book-btn"
            >
              Book a Bus
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <Link 
                to={`/shared/view-booking/${booking._id}`}
                key={booking._id} 
                className="booking-card clickable"
              >
                <div className="booking-card__header">
                  <h3>{booking.purpose} to {booking.venue}</h3>
                  <span className={`status-badge status-${booking.status?.toLowerCase().replace('_', '-') || 'pending'}`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
                <div className="booking-card__content">
                  <div className="info-row">
                    <span className="label">Trip Date:</span>
                    <span className="value">{new Date(booking.tripDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Bus:</span>
                    <span className="value">{booking.buses?.[0]?.registrationNumber || 'Not Assigned'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Students:</span>
                    <span className="value">{booking.totalStudents}</span>
                  </div>
                </div>
                <div className="view-details-hint">View details →</div>
              </Link>
            ))}
          </div>
        )}

        <button
          className="my-bookings__back-btn"
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: '2rem' }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default MyBookings;