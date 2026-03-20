// src/features/driver/pages/DriverDashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import MyTrips from "../components/MyTrips";
import dashboardService from "../../../services/dashboardService";
import { useAuth } from "../../../context/AuthContext"; // use the AuthContext

import "../driver.css";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    trips: [],
  });
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard("driver", user?._id);
      setDashboardData(data);
    } catch (err) {
      setError(err.error || err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, fetchDashboard]);

  const stats = useMemo(() => {
    const trips = dashboardData.trips || [];
    const acknowledged = trips.filter(t => t.driverAcknowledged).length;
    const waiting = trips.filter(t => !t.driverAcknowledged).length;
    return { acknowledged, waiting };
  }, [dashboardData.trips]);

  const filteredTrips = useMemo(() => {
    const trips = dashboardData.trips || [];
    if (filterType === "ALL") return trips;
    if (filterType === "ACKNOWLEDGED") return trips.filter(t => t.driverAcknowledged);
    if (filterType === "WAITING") return trips.filter(t => !t.driverAcknowledged);
    return trips;
  }, [dashboardData.trips, filterType]);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="driver-dashboard">
      <h2>Driver Dashboard</h2>

      <div className="driver-stats-container">
        <div 
          className={`driver-stat-card ${filterType === "ACKNOWLEDGED" ? "active-filter" : ""}`}
          onClick={() => setFilterType(filterType === "ACKNOWLEDGED" ? "ALL" : "ACKNOWLEDGED")}
          style={{ cursor: 'pointer' }}
        >
          <h4>Acknowledged Trips</h4>
          <span className="stat-value">{stats.acknowledged}</span>
        </div>
        <div 
          className={`driver-stat-card waiting ${filterType === "WAITING" ? "active-filter" : ""}`}
          onClick={() => setFilterType(filterType === "WAITING" ? "ALL" : "WAITING")}
          style={{ cursor: 'pointer' }}
        >
          <h4>Waiting Acknowledgement</h4>
          <span className="stat-value">{stats.waiting}</span>
        </div>
      </div>

      <div className="driver-section-header">
        <h3>
          {filterType === "ALL" ? "My Assigned Trips" : 
           filterType === "ACKNOWLEDGED" ? "Acknowledged Trips" : "Waiting Acknowledgement"}
          {filterType !== "ALL" && <span className="filter-count"> ({filteredTrips.length})</span>}
        </h3>
        {filterType !== "ALL" && (
          <button className="btn-clear-filter" onClick={() => setFilterType("ALL")}>
            Show All
          </button>
        )}
      </div>

      <MyTrips trips={filteredTrips} onUpdate={fetchDashboard} />
    </div>
  );
};

export default DriverDashboard;
