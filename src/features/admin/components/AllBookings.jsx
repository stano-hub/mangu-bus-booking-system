import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import bookingService from '../../../services/bookingService';
import Loader from '../../../components/layout/Loader';
import '../../shared/bookings/bookings.css'; // Shared CSS

const AllBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    if (!user || user.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      const errorMsg = err.error || err.message || 'Failed to fetch bookings';
      if (err.status === 403) {
        setError('Access denied. You do not have permission to view all bookings.');
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
    fetchBookings();
  }, [navigate, user]);

  const handleViewDetails = (id) => navigate(`/all-bookings/${id}`);

  return (
    <div className="bookings-container">
      <div className="all-bookings">
        <div className="all-bookings__header">
          <h2 className="all-bookings__title">All Bus Bookings</h2>
          <button
            className="all-bookings__refresh-btn"
            onClick={fetchBookings}
            disabled={loading}
            aria-label="Refresh bookings list"
          >
            {loading ? <span className="spinner"></span> : 'Refresh'}
          </button>
        </div>
        {error && (
          <div className="all-bookings__error">
            <p>{error}</p>
            <button
              onClick={fetchBookings}
              disabled={loading}
              aria-label="Retry fetching bookings"
            >
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <div className="all-bookings__empty">
            <p>No bookings found.</p>
            <button
              onClick={() => navigate('/admin')}
              aria-label="Back to admin panel"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="all-bookings__table-container">
            <table
              className="all-bookings__table"
              role="grid"
              aria-label="All bus bookings table"
            >
              <thead>
                <tr>
                  <th scope="col">Teacher</th>
                  <th scope="col">Venue</th>
                  <th scope="col">Bus</th>
                  <th scope="col">Capacity</th>
                  <th scope="col">Trip Date</th>
                  <th scope="col" className="hide-mobile">
                    Purpose
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="booking-row">
                    <td>{booking.createdBy?.name || 'N/A'}</td>
                    <td>{booking.venue || 'N/A'}</td>
                    <td>{booking.buses?.[0]?.busNumber || 'N/A'}</td>
                    <td>{booking.buses?.[0]?.capacity || 'N/A'}</td>
                    <td>
                      {new Date(booking.tripDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="hide-mobile">{booking.purpose || 'N/A'}</td>
                    <td>
                      <span
                        className={`status-badge status-${
                          booking.status?.toLowerCase().replace('_', '-') || 'pending'
                        }`}
                      >
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(booking._id)}
                        aria-label={`View details for booking ${booking._id}`}
                      >
                        View
                      </button>
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
};

export default AllBookings;