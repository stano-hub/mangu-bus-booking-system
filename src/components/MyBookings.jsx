import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/MyBookings.css';

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

function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({ travel_date: '', bus_registration: '', purpose: '' });
  const [availableBuses, setAvailableBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch available buses when editing and travel_date changes
  useEffect(() => {
    if (editingBooking && formData.travel_date) {
      const fetchAvailableBuses = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await axiosInstance.get(`/api/buses/available?date=${formData.travel_date}`);
          setAvailableBuses(res.data);
          setFormData((prev) => ({ ...prev, bus_registration: '' }));
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch available buses');
          setAvailableBuses([]);
          setLoading(false);
          if (err.response?.status === 401) {
            navigate('/signin');
          }
        }
      };
      fetchAvailableBuses();
    } else {
      setAvailableBuses([]);
    }
  }, [formData.travel_date, editingBooking, navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/api/bookings');
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
      setLoading(false);
      if (err.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking.booking_id);
    setFormData({
      travel_date: booking.travel_date,
      bus_registration: booking.bus_registration,
      purpose: booking.purpose || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setFormData({ travel_date: '', bus_registration: '', purpose: '' });
    setAvailableBuses([]);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e, bookingId) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.travel_date || !formData.bus_registration || !formData.purpose.trim()) {
      setError('Please provide a travel date, bus, and purpose.');
      return;
    }

    if (formData.travel_date < today) {
      setError('Travel date must be in the future.');
      return;
    }

    try {
      await axiosInstance.patch(`/api/bookings/${bookingId}`, {
        travel_date: formData.travel_date,
        bus_registration: formData.bus_registration,
        purpose: formData.purpose
      });
      setSuccess('Booking updated successfully!');
      setEditingBooking(null);
      setFormData({ travel_date: '', bus_registration: '', purpose: '' });
      setAvailableBuses([]);
      setBookings(
        bookings.map((booking) =>
          booking.booking_id === bookingId
            ? {
                ...booking,
                travel_date: formData.travel_date,
                bus_registration: formData.bus_registration,
                purpose: formData.purpose
              }
            : booking
        )
      );
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update booking');
      if (err.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setError('');
    setSuccess('');
    try {
      await axiosInstance.delete(`/api/bookings/${bookingId}`);
      setSuccess('Booking cancelled successfully!');
      setBookings(bookings.filter((booking) => booking.booking_id !== bookingId));
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
      if (err.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  return (
    <div className="my-bookings">
      <h2 className="my-bookings__title">My Bookings</h2>
      {error && <p className="my-bookings__error">{error}</p>}
      {success && <p className="my-bookings__success">{success}</p>}
      {loading && (
        <div className="my-bookings__loading">
          <div className="my-bookings__spinner"></div>
        </div>
      )}
      {!loading && bookings.length === 0 && (
        <p className="my-bookings__empty">No active bookings found.</p>
      )}
      <div className="my-bookings__list">
        {bookings.map((booking) => (
          <div key={booking.booking_id} className="my-bookings__item">
            {editingBooking === booking.booking_id ? (
              <form
                onSubmit={(e) => handleEditSubmit(e, booking.booking_id)}
                className="my-bookings__form"
              >
                <div className="my-bookings__form-group">
                  <label htmlFor="travel_date" className="my-bookings__label">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    id="travel_date"
                    name="travel_date"
                    value={formData.travel_date}
                    onChange={handleChange}
                    min={today}
                    className="my-bookings__input"
                    required
                  />
                </div>
                <div className="my-bookings__form-group">
                  <label htmlFor="bus_registration" className="my-bookings__label">
                    Select Bus
                  </label>
                  <select
                    id="bus_registration"
                    name="bus_registration"
                    value={formData.bus_registration}
                    onChange={handleChange}
                    className="my-bookings__input"
                    disabled={!formData.travel_date || loading || availableBuses.length === 0}
                    required
                  >
                    <option value="">Select a bus</option>
                    {availableBuses.map((bus) => (
                      <option key={bus.registration_number} value={bus.registration_number}>
                        {bus.registration_number} (Capacity: {bus.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="my-bookings__form-group">
                  <label htmlFor="purpose" className="my-bookings__label">
                    Purpose
                  </label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="my-bookings__textarea"
                    placeholder="Enter the purpose of the trip"
                    required
                  />
                </div>
                <div className="my-bookings__form-actions">
                  <button
                    type="submit"
                    className="my-bookings__button my-bookings__button--save"
                    disabled={
                      loading ||
                      !formData.travel_date ||
                      !formData.bus_registration ||
                      !formData.purpose.trim()
                    }
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="my-bookings__button my-bookings__button--cancel"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="my-bookings__details">
                <p>
                  <strong>Bus:</strong> {booking.bus_registration} (Capacity: {booking.capacity})
                </p>
                <p>
                  <strong>Travel Date:</strong> {booking.travel_date}
                </p>
                <p>
                  <strong>Purpose:</strong> {booking.purpose || 'N/A'}
                </p>
                <p>
                  <strong>Booking Date:</strong> {booking.booking_date}
                </p>
                <p>
                  <strong>Phone Number:</strong> {formatPhoneNumber(booking.phone_number)}
                </p>
                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
                <div className="my-bookings__actions">
                  <button
                    className="my-bookings__button my-bookings__button--edit"
                    onClick={() => handleEdit(booking)}
                    disabled={booking.status !== 'active'}
                  >
                    Edit
                  </button>
                  <button
                    className="my-bookings__button my-bookings__button--delete"
                    onClick={() => handleCancelBooking(booking.booking_id)}
                    disabled={booking.status !== 'active'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;