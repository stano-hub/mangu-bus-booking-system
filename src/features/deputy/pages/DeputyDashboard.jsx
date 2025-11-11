// src/features/deputy/pages/DeputyDashboard.jsx
import React, { useEffect, useState } from "react";
import dashboardService from "../../../services/dashboardService";
import deputyService from "../../../services/deputyService";
import busService from "../../../services/busService";
import { useAuth } from '../../../context/AuthContext';
import Loader from "../../../components/layout/Loader";
import "../deputy.css";

const DeputyDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    pendingBookings: [],
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedBuses, setSelectedBuses] = useState({}); // { bookingId: [busIds] }

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const data = await dashboardService.getDashboard("deputy", user._id);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchBuses();
  }, [user]);

  const fetchBuses = async () => {
    try {
      const res = await busService.getAllBuses();
      setAvailableBuses(res.buses || []);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
    }
  };

  const handleApprove = async (bookingId) => {
    const buses = selectedBuses[bookingId] || [];
    if (buses.length === 0) {
      setError("Please select at least one bus to assign");
      return;
    }

    setActionLoading(bookingId);
    setError("");
    setSuccess("");

    try {
      await deputyService.approveBooking(bookingId, { buses });
      setSuccess("Booking approved successfully!");
      setSelectedBuses({ ...selectedBuses, [bookingId]: [] });
      
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
      await deputyService.rejectBooking(bookingId, comment || "");
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
    <div className="deputy-dashboard">
      <h2>Deputy Dashboard</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p className="stat-number">{dashboardData.totalPending}</p>
        </div>
      </div>

      <div className="bookings-section">
        <h3>Pending Bookings</h3>
        {dashboardData.pendingBookings.length === 0 ? (
          <p className="no-bookings">No pending bookings at the moment.</p>
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
                {dashboardData.pendingBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.createdBy?.name || "N/A"}</td>
                    <td>{booking.purpose}</td>
                    <td>{booking.venue}</td>
                    <td>{new Date(booking.tripDate).toLocaleDateString()}</td>
                    <td>
                      {booking.buses && booking.buses.length > 0 ? (
                        booking.buses.map(b => b.busNumber || b.busNumber).join(', ')
                      ) : (
                        <select
                          multiple
                          value={selectedBuses[booking._id] || []}
                          onChange={(e) => {
                            const busIds = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedBuses({ ...selectedBuses, [booking._id]: busIds });
                          }}
                          style={{ minWidth: '150px', padding: '0.5rem' }}
                        >
                          {availableBuses.filter(b => b.status === 'available').map(bus => (
                            <option key={bus._id} value={bus._id}>
                              {bus.busNumber} ({bus.capacity} seats)
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <span className="status-badge status-pending">
                        {booking.status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {(!booking.buses || booking.buses.length === 0) && (
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(booking._id)}
                            disabled={actionLoading === booking._id || !selectedBuses[booking._id]?.length}
                          >
                            {actionLoading === booking._id ? "Processing..." : "Approve"}
                          </button>
                        )}
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

export default DeputyDashboard;
