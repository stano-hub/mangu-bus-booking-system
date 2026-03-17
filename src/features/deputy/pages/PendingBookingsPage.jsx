// src/features/deputy/pages/PendingBookingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import deputyService from "../../../services/deputyService";
import Loader from "../../../components/layout/Loader";
import "../deputy.css";

const PendingBookingsPage = () => {
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [bookingsRes] = await Promise.all([
          deputyService.getPendingBookings(),
        ]);

        if (bookingsRes.success) {
          setPendingBookings(bookingsRes.bookings || []);
        }
      } catch (err) {
        setError(err.error || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) return <Loader />;

  return (
    <div className="deputy-dashboard">
      <div className="dashboard-content">
        <h2>Pending Bookings</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="bookings-section">
          {pendingBookings.length === 0 ? (
            <div className="no-bookings">No pending bookings</div>
          ) : (
            <div className="bookings-grid">
              {pendingBookings.map((booking) => (
                <Link 
                  to={`/shared/view-booking/${booking._id}`} 
                  key={booking._id} 
                  className="booking-card clickable"
                >
                  <div className="booking-card__header">
                    <h4>{booking.purpose}</h4>
                    <span className="status-badge status-pending">
                      {booking.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>

                  <div className="booking-card__content">
                    <div className="info-row">
                      <span className="label">Teacher:</span>
                      <span className="value">{booking.createdBy?.name || "N/A"}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Destination:</span>
                      <span className="value">{booking.venue}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Trip Date:</span>
                      <span className="value">{new Date(booking.tripDate).toLocaleDateString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Time:</span>
                      <span className="value">{booking.departureTime} - {booking.returnTime}</span>
                    </div>
                  </div>
                  <div className="view-details-hint">Click to Approve/Reject →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingBookingsPage;
