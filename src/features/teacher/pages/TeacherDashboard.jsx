// src/features/teacher/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import dashboardService from "../../../services/dashboardService";
import bookingService from "../../../services/bookingService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/layout/Loader";
import "../teacher.css";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    upcomingBookings: [],
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const [dashData, bookingsData] = await Promise.all([
          dashboardService.getDashboard("teacher", user._id),
          bookingService.getMyBookings(),
        ]);

        setDashboardData(dashData);
        setBookings(bookingsData.bookings || []);
      } catch (err) {
        const errorMsg = err.error || err.message || "Failed to fetch dashboard data";
        if (err.status === 403) {
          toast.error("Access denied. You do not have permission to view this data.");
        } else if (err.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else {
          toast.error(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);


  if (loading) return <Loader />;

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header-flex">
        <h2>Teacher Dashboard</h2>
        <button 
          className="btn-primary"
          onClick={() => navigate("/teacher/book")}
        >
          Book a Bus
        </button>
      </div>

      <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{dashboardData.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Trips</h3>
          <p className="stat-number">{dashboardData.upcomingBookings?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Trips Ready to Go</h3>
          <p className="stat-number">{bookings.filter(b => b.driverAcknowledged).length}</p>
        </div>
      </div>

      <div className="bookings-section">
        <h3>My Booking Requests</h3>
        {bookings.length === 0 ? (
          <p className="no-bookings">No bookings yet. Create your first booking request!</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              // Determine status tab properties
              let tabClass = "tab-pending";
              let tabText = "⏳ Awaiting review";

              if (booking.status === "PENDING" || booking.status === "DEPUTY_REVIEW") {
                tabClass = "tab-pending";
                tabText = "⏳ Awaiting Deputy review";
              } else if (booking.status === "DEPUTY_APPROVED") {
                tabClass = "tab-pending";
                tabText = "✓ Approved by Deputy - Awaiting Principal approval";
              } else if (booking.status === "PRINCIPAL_APPROVED" && !booking.driverAcknowledged) {
                tabClass = "tab-approved";
                tabText = "✓ Approved by Principal - Awaiting Driver acknowledgment";
              } else if (booking.driverAcknowledged) {
                tabClass = "tab-ready";
                tabText = "🚍 Trip is set to go! (Driver Acknowledged)";
              } else if (booking.status === "REJECTED") {
                tabClass = "tab-rejected";
                const rejectionComment = booking.comments?.find(c => c.role === 'deputy' || c.role === 'principal')?.message;
                tabText = `❌ Rejected: ${rejectionComment || "No reason provided"}`;
              } else if (booking.status === "CANCELLED") {
                tabClass = "tab-rejected";
                tabText = "🚫 Booking Cancelled";
              }

              return (
                <Link 
                  to={`/shared/view-booking/${booking._id}`}
                  key={booking._id} 
                  className={`booking-card clickable ${booking.driverAcknowledged ? 'booking-card-driver-acknowledged' : ''}`}
                  title="Click to view full booking details"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="booking-header">
                    <h4>{booking.purpose} - {booking.venue}</h4>
                    <span className={`status-badge status-${booking.status?.toLowerCase().replace('_', '-')}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p><strong>Venue:</strong> {booking.venue}</p>
                    <p><strong>Date:</strong> {new Date(booking.tripDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {booking.departureTime} - {booking.returnTime}</p>
                    <p><strong>Total Students:</strong> {booking.totalStudents}</p>
                    {booking.buses && booking.buses.length > 0 && (
                      <p><strong>Assigned Buses:</strong> {booking.buses.map(b => b.registrationNumber).join(', ')}</p>
                    )}
                    
                    <div className={`booking-status-tab ${tabClass}`}>
                      {tabText}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;