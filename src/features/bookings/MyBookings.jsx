import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import busService from '../../services/busService';
import './bookings.css';

const MyBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [editBookingId, setEditBookingId] = useState(null);
  const [formData, setFormData] = useState({ busId: '', travelDate: '', purpose: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse position for face animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Reset success animation and message
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('User role:', user.role, 'Calling: getMyBookings');
        const data = await bookingService.getMyBookings();
        setBookings(data || []);
        setIsSuccess(true);
      } catch (err) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  // Fetch available buses when editing and travelDate changes
  useEffect(() => {
    const fetchBuses = async () => {
      if (!formData.travelDate || !editBookingId) return;
      try {
        const buses = await busService.getAvailableBuses(formData.travelDate);
        setAvailableBuses(buses || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch available buses');
      }
    };
    fetchBuses();
  }, [formData.travelDate, editBookingId]);

  const handleEdit = (booking) => {
    setEditBookingId(booking._id);
    setFormData({
      busId: booking.bus?._id || '',
      travelDate: new Date(booking.travelDate).toISOString().split('T')[0],
      purpose: booking.purpose || '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditBookingId(null);
    setFormData({ busId: '', travelDate: '', purpose: '' });
    setAvailableBuses([]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate travelDate
    const selectedDate = new Date(formData.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Travel date cannot be in the past');
      return;
    }

    try {
      await bookingService.updateBooking(editBookingId, {
        busId: formData.busId,
        travelDate: formData.travelDate,
        purpose: formData.purpose,
      });
      setSuccess('Booking updated successfully');
      setIsSuccess(true);
      setEditBookingId(null);
      setFormData({ busId: '', travelDate: '', purpose: '' });
      setAvailableBuses([]);
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to update booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully');
      setIsSuccess(true);
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="bookings-container">
      <div className="bookings" data-success={isSuccess}>
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
        <h2 className="bookings__title">My Bookings</h2>
        {loading ? (
          <div className="bookings__loading">
            <span className="bookings__spinner"></span>
            <p>Loading bookings...</p>
          </div>
        ) : (
          <>
            {success && <p className="bookings__success">{success}</p>}
            {error && <p className="bookings__error">{error}</p>}
            {editBookingId ? (
              <form onSubmit={handleSubmit} className="bookings__form" role="form" aria-label="Edit booking form">
                <label htmlFor="travelDate">
                  Travel Date
                  <input
                    type="date"
                    id="travelDate"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    required
                    aria-label="Select travel date"
                  />
                </label>
                <label htmlFor="busId">
                  Select Bus
                  {availableBuses.length === 0 && formData.travelDate ? (
                    <p className="bookings__empty">No buses available for this date</p>
                  ) : (
                    <select
                      id="busId"
                      name="busId"
                      value={formData.busId}
                      onChange={handleChange}
                      required
                      disabled={!formData.travelDate || availableBuses.length === 0}
                      aria-label="Select a bus"
                    >
                      <option value="">-- Select Bus --</option>
                      {availableBuses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.registrationNumber} ({bus.capacity} seats, {bus.description})
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                <label htmlFor="purpose">
                  Purpose
                  <input
                    type="text"
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="e.g., School trip"
                    required
                    aria-label="Purpose of the trip"
                  />
                </label>
                <div className="bookings__form-buttons">
                  <button
                    type="submit"
                    className="bookings__submit-btn"
                    disabled={!formData.busId || !formData.travelDate}
                    aria-label="Update booking"
                  >
                    Update Booking
                  </button>
                  <button
                    type="button"
                    className="bookings__cancel-btn"
                    onClick={handleCancelEdit}
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {bookings.length === 0 ? (
                  <p className="bookings__empty">No bookings found 🚌</p>
                ) : (
                  <div className="bookings__cards">
                    {bookings.map((b) => (
                      <div key={b._id} className="bookings__card">
                        <h3>{b.bus?.registrationNumber || 'N/A'}</h3>
                        <p>Description: {b.bus?.description || 'N/A'}</p>
                        <p>Date: {new Date(b.travelDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
                        <p>Seats: {b.bus?.capacity || 'N/A'}</p>
                        <p>Purpose: {b.purpose || 'N/A'}</p>
                        <p>Status: <span className={`status-badge status-${b.status?.toLowerCase() || 'active'}`}>{b.status || 'Active'}</span></p>
                        {b.status !== 'cancelled' && (
                          <div className="bookings__card-buttons">
                            <button
                              className="bookings__edit-btn"
                              onClick={() => handleEdit(b)}
                              aria-label={`Edit booking for ${b.bus?.registrationNumber || 'bus'}`}
                            >
                              Edit
                            </button>
                            <button
                              className="bookings__cancel-btn"
                              onClick={() => handleCancel(b._id)}
                              aria-label={`Cancel booking for ${b.bus?.registrationNumber || 'bus'}`}
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
                  className="bookings__back-btn"
                  onClick={() => navigate('/dashboard')}
                  aria-label="Back to dashboard"
                >
                  Back
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;