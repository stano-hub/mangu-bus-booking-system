import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import './bookings.css';

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch bookings');
      if (error.status === 401) navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  return (
    <div className="bookings-container">
      <div className="all-bookings">
        <div className="all-bookings__header">
          <h2 className="all-bookings__title">All Bus Bookings</h2>
          <button
            className="all-bookings__refresh-btn"
            onClick={fetchBookings}
            aria-label="Refresh bookings list"
          >
            Refresh
          </button>
        </div>
        {error && (
          <div className="all-bookings__error">
            <p>{error}</p>
            <button
              onClick={fetchBookings}
              aria-label="Retry fetching bookings"
            >
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="all-bookings__loading">
            <span className="all-bookings__spinner"></span>
            <p>Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="all-bookings__empty">
            <p>No bookings found.</p>
            <button
              onClick={() => navigate('/book-bus')}
              aria-label="Go to book a bus"
            >
              Book a Bus
            </button>
          </div>
        ) : (
          <div className="all-bookings__table-container">
            <table className="all-bookings__table" role="grid" aria-label="All bus bookings table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Bus</th>
                  <th>Capacity</th>
                  <th>Travel Date</th>
                  <th className="hide-mobile">Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.teacher?.name || booking.teacher?._id || 'N/A'}</td>
                    <td>{booking.bus?.registrationNumber || 'N/A'}</td>
                    <td>{booking.bus?.capacity || 'N/A'}</td>
                    <td>
                      {new Date(booking.travelDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="hide-mobile">{booking.purpose || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${booking.status?.toLowerCase() || 'active'}`}>
                        {booking.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllBookings;