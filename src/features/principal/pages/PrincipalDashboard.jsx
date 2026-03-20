// src/features/principal/pages/PrincipalDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import dashboardService from "../../../services/dashboardService";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/layout/Loader";
import "../principal.css";

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    deputyApprovedBookings: [],
    totalDeputyApproved: 0,
  });
  const [filterActive, setFilterActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      if (!user) return;

      const data = await dashboardService.getDashboard("principal", user._id);
      setDashboardData(data);
    } catch (err) {
      setError(err.error || err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, user]);


  if (loading) return <Loader />;

  return (
    <div className="principal-dashboard">
      <h2>Principal Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div 
          className={`stat-card clickable-stat ${filterActive ? "active-filter" : ""}`}
          onClick={() => setFilterActive(!filterActive)}
        >
          <h3>Awaiting Final Approval</h3>
          <p className="stat-number">{dashboardData.totalDeputyApproved}</p>
        </div>
      </div>

      <div className="bookings-section">
        <div className="section-header-flex">
          <h3>
            Deputy-Approved Bookings
            {filterActive && <span className="filter-count"> ({dashboardData.deputyApprovedBookings.length})</span>}
          </h3>
          {filterActive && (
            <button className="btn-clear-filter" onClick={() => setFilterActive(false)}>
              Show All
            </button>
          )}
        </div>
        {dashboardData.deputyApprovedBookings.length === 0 ? (
          <p className="no-bookings">No bookings awaiting your approval.</p>
        ) : (
        <div className="bookings-grid">
          {dashboardData.deputyApprovedBookings.map((booking) => (
            <Link 
              to={`/shared/view-booking/${booking._id}`} 
              key={booking._id} 
              className="booking-card clickable"
            >
              <div className="booking-card__header">
                <h4>{booking.purpose}</h4>
                <span className="status-badge status-deputy-approved">
                  {booking.status.replace('_', ' ')}
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
                  <span className="label">Bus:</span>
                  <span className="value">
                    {booking.buses && booking.buses.length > 0
                      ? booking.buses.map(b => b.registrationNumber).join(', ')
                      : "Not Assigned"}
                  </span>
                </div>
              </div>
              <div className="view-details-hint">Click for Final Approval →</div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalDashboard;