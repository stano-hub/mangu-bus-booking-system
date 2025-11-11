// src/features/admin/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import dashboardService from "../../../services/dashboardService";
import Loader from "../../../components/layout/Loader";
import "../../admin/admin.css"; // admin styles

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    teachersCount: 0,
    busesCount: 0,
    bookingsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await dashboardService.getDashboard("admin", user._id);
        setData(res);
        setError("");
      } catch (err) {
        const errorMsg = err.error || err.message || "Failed to fetch admin dashboard data";
        if (err.status === 403) {
          setError("Access denied. You do not have permission to view this page.");
        } else if (err.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {error && (
        <div className="error-message" style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          <p>{error}</p>
        </div>
      )}

      <div className="admin-stats">
        <div className="stat-card">
          <h2>Teachers</h2>
          <p>{data.teachersCount}</p>
        </div>
        <div className="stat-card">
          <h2>Buses</h2>
          <p>{data.busesCount}</p>
        </div>
        <div className="stat-card">
          <h2>Bookings</h2>
          <p>{data.bookingsCount}</p>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="buttons">
          <button onClick={() => navigate("/admin/manage-teachers")}>
            Manage Teachers
          </button>
          <button onClick={() => navigate("/admin/manage-buses")}>
            Manage Buses
          </button>
          <button onClick={() => navigate("/admin/all-bookings")}>
            View All Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
