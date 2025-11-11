import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../../../services/bookingService';
import busService from '../../../../services/busService';
import '../bookings.css'; // Co-located CSS

const MyBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [editBookingId, setEditBookingId] = useState(null);
  const [formData, setFormData] = useState({ busId: '', tripDate: '', purpose: '', venue: '' });
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data.bookings || []);
      } catch (err) {
        const errorMsg = err.error || err.message || 'Failed to load bookings';
        if (err.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user, navigate]);

  useEffect(() => {
    const fetchBuses = async () => {
      if (!formData.tripDate || !editBookingId) return;
      setEditLoading(true);
      try {
        const data = await busService.getAvailableBuses(formData.tripDate);
        setAvailableBuses(data.buses || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch available buses');
      } finally {
        setEditLoading(false);
      }
    };
    fetchBuses();
  }, [formData.tripDate, editBookingId]);

  const handleEdit = (booking) => {
    setEditBookingId(booking._id);
    setFormData({
      busId: booking.buses?.[0]?._id || '',
      tripDate: new Date(booking.tripDate).toISOString().split('T')[0],
      purpose: booking.purpose || '',
      venue: booking.venue || ''
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCancelEdit = () => {
    setEditBookingId(null);
    setFormData({ busId: '', tripDate: '', purpose: '', venue: '' });
    setAvailableBuses([]);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const selectedDate = new Date(formData.tripDate);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      setError('Trip date cannot be in the past');
      return;
    }
    try {
      await bookingService.updateBooking(editBookingId, formData);
      setSuccess('Booking updated successfully');
      setTimeout(async () => {
        const data = await bookingService.getMyBookings();
        setBookings(data.bookings || []);
        setEditBookingId(null);
        setFormData({ busId: '', tripDate: '', purpose: '', venue: '' });
        setAvailableBuses([]);
      }, 1500);
    } catch (err) {
      setError(err.error || err.message || 'Failed to update booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully');
      setTimeout(async () => {
        const data = await bookingService.getMyBookings();
        setBookings(data.bookings || []);
      }, 1500);
    } catch (err) {
      setError(err.error || err.message || 'Failed to cancel booking');
    }
  };

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
        {success && <p className="my-bookings__success">{success}</p>}
        {error && <p className="my-bookings__error">{error}</p>}
        {editBookingId ? (
          <form onSubmit={handleSubmit} className="my-bookings__form">
            <label htmlFor="tripDate">
              Trip Date
              <input
                type="date"
                id="tripDate"
                name="tripDate"
                value={formData.tripDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </label>
            <label htmlFor="venue">
              Venue
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </label>
            <label htmlFor="busId">
              Bus
              <select
                id="busId"
                name="busId"
                value={formData.busId}
                onChange={handleChange}
                required
                disabled={!formData.tripDate || availableBuses.length === 0 || editLoading}
              >
                <option value="">Select Bus</option>
                {availableBuses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.busNumber} ({bus.capacity} seats)
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="purpose">
              Purpose
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              />
            </label>
            <div className="my-bookings__form-buttons">
              <button
                type="submit"
                className="my-bookings__submit-btn"
                disabled={editLoading || !formData.busId || !formData.tripDate}
              >
                {editLoading ? <span className="spinner"></span> : 'Update Booking'}
              </button>
              <button
                type="button"
                className="my-bookings__cancel-btn"
                onClick={handleCancelEdit}
                disabled={editLoading}
              >
                Cancel Edit
              </button>
            </div>
          </form>
        ) : (
          <>
            {bookings.length === 0 ? (
              <div className="my-bookings__empty">
                <p>No bookings found.</p>
                <button
                  onClick={() => navigate('/dashboard/book-bus')}
                  className="my-bookings__book-btn"
                >
                  Book a Bus
                </button>
              </div>
            ) : (
              <div className="my-bookings__list">
                {bookings.map((booking) => (
                  <div key={booking._id} className="my-bookings__item">
                    <h3>{booking.purpose} to {booking.venue}</h3>
                    <p>
                      Trip Date:{' '}
                      {new Date(booking.tripDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                    <p>Bus: {booking.buses?.[0]?.busNumber || 'N/A'}</p>
                    <p>Total Students: {booking.totalStudents}</p>
                    <p>
                      Status:{' '}
                      <span
                        className={`status-badge status-${
                          booking.status?.toLowerCase().replace('_', '-') || 'pending'
                        }`}
                      >
                        {booking.status || 'Pending'}
                      </span>
                    </p>
                    {booking.status !== 'CANCELLED' && (
                      <div className="my-bookings__actions">
                        <button
                          className="my-bookings__edit-btn"
                          onClick={() => handleEdit(booking)}
                        >
                          Edit
                        </button>
                        <button
                          className="my-bookings__cancel-btn"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              className="my-bookings__back-btn"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;