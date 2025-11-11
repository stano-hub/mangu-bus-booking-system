// src/features/driver/pages/DriverDashboard.jsx
import React, { useEffect, useState } from "react";
import ExtraBuses from "../components/ExtraBuses";
import MyTrips from "../components/MyTrips";
import dashboardService from "../../../services/dashboardService";
import { useAuth } from "../../../context/AuthContext"; // use the AuthContext

import "../driver.css";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    trips: [],
    extraBuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard("driver", user?._id);
      setDashboardData(data);
    } catch (err) {
      setError(err.error || err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="driver-dashboard">
      <h2>Driver Dashboard</h2>

      <MyTrips trips={dashboardData.trips} onUpdate={fetchDashboard} />
      <ExtraBuses extraBuses={dashboardData.extraBuses} onUpdate={fetchDashboard} />
    </div>
  );
};

export default DriverDashboard;
