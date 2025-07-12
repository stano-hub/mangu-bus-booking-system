import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AllBookings.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

// Format phone number (assumes Kenyan format, e.g., +254123456789)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  // Assuming phone numbers are stored as +254XXXXXXXXX
  const match = phoneNumber.match(/^\+254(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber; // Return raw if format doesn't match
};

function AllBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/api/bookings');
        setBookings(res.data);
        setLoading(false);
      } catch (error) {
        const errMsg = error.response?.data?.error || 'Failed to fetch bookings';
        setError(errMsg);
        setLoading(false);
        if (error.response?.status === 401) {
          navigate('/signin');
        }
      }
    };
    fetchBookings();
  }, [navigate]);

  return (
    <div className="all-bookings">
      <h2 className="all-bookings__title">All Bus Bookings</h2>
      {error && <p className="all-bookings__error">{error}</p>}
      {loading ? (
        <div className="all-bookings__loading">
          <div className="all-bookings__spinner"></div>
        </div>
      ) : bookings.length === 0 ? (
        <p className="all-bookings__empty">No bookings found.</p>
      ) : (
        <div className="all-bookings__table-container">
          <table className="all-bookings__table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Phone</th>
                <th>Bus</th>
                <th>Capacity</th>
                <th>Travel Date</th>
                <th>Purpose</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{`${booking.first_name} ${booking.last_name}`}</td>
                  <td>{formatPhoneNumber(booking.phone_number)}</td>
                  <td>{booking.bus_registration}</td>
                  <td>{booking.capacity}</td>
                  <td>{booking.travel_date}</td>
                  <td>{booking.purpose || 'N/A'}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AllBookings;