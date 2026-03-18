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

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="driver-dashboard">
      <h2>Driver Dashboard</h2>

      <div className="driver-stats-container">
        <div className="driver-stat-card">
          <h4>Acknowledged Trips</h4>
          <span className="stat-value">{stats.acknowledged}</span>
        </div>
        <div className="driver-stat-card waiting">
          <h4>Waiting Acknowledgement</h4>
          <span className="stat-value">{stats.waiting}</span>
        </div>
      </div>

      <MyTrips trips={dashboardData.trips} onUpdate={fetchDashboard} />
    </div>
  );
};

export default DriverDashboard;
