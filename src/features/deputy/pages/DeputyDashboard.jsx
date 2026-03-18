// src/features/deputy/pages/DeputyDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import bookingService from "../../../services/bookingService";
import { useAuth } from '../../../context/AuthContext';
import Loader from "../../../components/layout/Loader";
import "../deputy.css";

const DeputyDashboard = () => {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // { bookingId: [busIds] }

  const fetchAllBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;

      const res = await bookingService.getAllBookings();
      if (res.success) {
        const bookings = res.bookings || [];
        setAllBookings(bookings);
        
        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === "PENDING").length,
          approvedBookings: bookings.filter(b => b.status === "DEPUTY_APPROVED" || b.status === "PRINCIPAL_APPROVED" || b.status === "APPROVED").length,
          rejectedBookings: bookings.filter(b => b.status === "REJECTED").length,
        });
      }
    } catch (err) {
      setError(err.error || err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "DEPUTY_APPROVED":
      case "PRINCIPAL_APPROVED":
      case "APPROVED":
        return "status-approved";
      case "REJECTED":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ') || 'Unknown';
  };

  if (loading) return <Loader />;

  return (
    <div className="deputy-dashboard">
      <h2>Deputy Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p className="stat-number">{stats.pendingBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p className="stat-number">{stats.approvedBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <p className="stat-number">{stats.rejectedBookings}</p>
        </div>
      </div>

      <div className="bookings-section">
        <h3>All Bookings</h3>
        {allBookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          <div className="bookings-cards-grid">
            {allBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <h4>{booking.purpose}</h4>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {formatStatus(booking.status)}
                  </span>
                </div>
                
                <div className="booking-card-body">
                  <div className="booking-info-row">
                    <span className="label">Teacher:</span>
                    <span className="value">{booking.createdBy?.name || "N/A"}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="label">Destination:</span>
                    <span className="value">{booking.venue}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="label">Trip Date:</span>
                    <span className="value">{new Date(booking.tripDate).toLocaleDateString()}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="label">Time:</span>
                    <span className="value">{booking.departureTime} - {booking.returnTime}</span>
                  </div>
                  <div className="booking-info-row">
                    <span className="label">Students:</span>
                    <span className="value">{booking.totalStudents || 0}</span>
                  </div>
                  {booking.buses && booking.buses.length > 0 && (
                    <div className="booking-info-row">
                      <span className="label">Buses:</span>
                      <span className="value">
                        {booking.buses.map(b => b.registrationNumber).join(', ')}
                      </span>
                    </div>
                  )}
                  {booking.accompanyingTeachers && booking.accompanyingTeachers.length > 0 && (
                    <div className="booking-info-row">
                      <span className="label">Teachers:</span>
                      <span className="value">
                        {booking.accompanyingTeachers.map(t => t.name || t).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {booking.deputyComment && (
                  <div className="booking-comment">
                    <strong>Deputy Note:</strong> {booking.deputyComment}
                  </div>
                )}
                {booking.principalComment && (
                  <div className="booking-comment">
                    <strong>Principal Note:</strong> {booking.principalComment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeputyDashboard;
