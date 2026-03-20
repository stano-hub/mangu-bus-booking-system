import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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

  const fetchBookings = useCallback(async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'principal')) {
      setError('Access denied. Admin or Principal role required.');
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
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelledTrips = bookings.filter(b => b.status === 'CANCELLED');

  const handleDeleteCancelled = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete all ${cancelledTrips.length} cancelled bookings?`)) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await bookingService.deleteAllCancelledBookings();
      toast.success(res.message || "Cancelled bookings deleted successfully.");
      await fetchBookings();
    } catch (err) {
      setError(err.error || err.message || "Failed to delete cancelled bookings");
      setLoading(false);
    }
  };

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
          {user && user.role === 'admin' && cancelledTrips.length > 0 && (
            <button
              className="all-bookings__refresh-btn"
              onClick={handleDeleteCancelled}
              disabled={loading}
              style={{ backgroundColor: '#dc3545', marginLeft: '10px' }}
              aria-label="Delete all cancelled bookings"
            >
              Clear Cancelled ({cancelledTrips.length})
            </button>
          )}
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
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <Link 
                to={`/shared/view-booking/${booking._id}`} 
                key={booking._id} 
                className="booking-card clickable"
              >
                <div className="booking-card__header">
                  <h3>{booking.purpose || 'Bus Request'}</h3>
                  <span className={`status-badge status-${booking.status?.toLowerCase().replace('_', '-') || 'pending'}`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
                
                <div className="booking-card__content">
                  <div className="info-row">
                    <span className="label">Teacher:</span>
                    <span className="value">{booking.createdBy?.name || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Destination:</span>
                    <span className="value">{booking.venue || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Trip Date:</span>
                    <span className="value">
                      {new Date(booking.tripDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Bus:</span>
                    <span className="value">
                      {booking.buses?.[0]?.registrationNumber || 'Not Assigned'}
                    </span>
                  </div>
                </div>
                <div className="booking-card__footer">
                  <div className="view-details-hint">Click for full details →</div>
                  {user && user.role === 'admin' && booking.status === 'CANCELLED' && (
                    <button
                      className="btn-delete-small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to permanently delete this cancelled booking?")) {
                          bookingService.deleteBookingAdmin(booking._id)
                            .then(() => {
                              toast.success("Booking deleted");
                              fetchBookings();
                            })
                            .catch(err => toast.error(err.error || "Failed to delete"));
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBookings;