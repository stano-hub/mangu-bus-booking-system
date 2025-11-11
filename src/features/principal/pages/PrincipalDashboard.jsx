// src/features/principal/pages/PrincipalDashboard.jsx
import React, { useEffect, useState } from "react";
import dashboardService from "../../../services/dashboardService";
import principalService from "../../../services/principalService";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/layout/Loader";
import "../principal.css";

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    deputyApprovedBookings: [],
    totalDeputyApproved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const data = await dashboardService.getDashboard("principal", user._id);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleApprove = async (bookingId) => {
    const comment = window.prompt("Enter approval comment (optional):");
    if (comment === null) return; // User cancelled

    setActionLoading(bookingId);
    setError("");
    setSuccess("");

    try {
      await principalService.approveBooking(bookingId, comment || "");
      setSuccess("Booking approved successfully!");
      
      // Refresh dashboard
      await fetchDashboard();
    } catch (err) {
      setError(err.error || err.message || "Failed to approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    const comment = window.prompt("Enter rejection reason (optional):");
    if (comment === null) return; // User cancelled

    setActionLoading(bookingId);
    setError("");
    setSuccess("");

    try {
      await principalService.rejectBooking(bookingId, comment || "");
      setSuccess("Booking rejected.");
      
      // Refresh dashboard
      await fetchDashboard();
    } catch (err) {
      setError(err.error || err.message || "Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="principal-dashboard">
      <h2>Principal Dashboard</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Awaiting Final Approval</h3>
          <p className="stat-number">{dashboardData.totalDeputyApproved}</p>
        </div>
      </div>

      <div className="bookings-section">
        <h3>Deputy-Approved Bookings</h3>
        {dashboardData.deputyApprovedBookings.length === 0 ? (
          <p className="no-bookings">No bookings awaiting your approval.</p>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Purpose</th>
                  <th>Destination</th>
                  <th>Trip Date</th>
                  <th>Bus</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.deputyApprovedBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.createdBy?.name || "N/A"}</td>
                    <td>{booking.purpose}</td>
                    <td>{booking.venue}</td>
                    <td>{new Date(booking.tripDate).toLocaleDateString()}</td>
                    <td>
                      {booking.buses && booking.buses.length > 0
                        ? booking.buses.map(b => b.busNumber).join(', ')
                        : "Not Assigned"}
                    </td>
                    <td>
                      <span className="status-badge status-deputy-approved">
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          {actionLoading === booking._id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          Reject
                        </button>
                      </div>
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

export default PrincipalDashboard;