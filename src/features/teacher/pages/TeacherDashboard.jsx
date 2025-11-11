// src/features/teacher/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import dashboardService from "../../../services/dashboardService";
import bookingService from "../../../services/bookingService";
import userService from "../../../services/userService";
import { useAuth } from "../../../context/AuthContext";
import Loader from "../../../components/layout/Loader";
import "../teacher.css";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    upcomingBookings: [],
  });
  const [bookings, setBookings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    purpose: "",
    venue: "",
    tripDate: "",
    departureTime: "",
    returnTime: "",
    students: {
      form1: 0,
      form2: 0,
      form3: 0,
      form4: 0,
    },
    accompanyingTeachers: [],
  });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        if (!user) return;

        // Fetch dashboard and bookings in parallel
        const [dashData, bookingsData] = await Promise.all([
          dashboardService.getDashboard("teacher", user._id),
          bookingService.getMyBookings(),
        ]);

        setDashboardData(dashData);
        setBookings(bookingsData.bookings || []);

        // Try to fetch teachers, but don't fail if it's not allowed (403)
        // This is optional - teachers list is only needed for booking form
        try {
          const teachersData = await userService.getAllTeachers();
          setTeachers(teachersData.teachers || []);
        } catch (teacherErr) {
          // If 403, teachers can't fetch the list - that's okay, they can still create bookings
          // Just log it and continue without the teachers list
          if (teacherErr.status !== 403) {
            console.warn("Could not fetch teachers list:", teacherErr);
          }
          // Set empty array so the form still works
          setTeachers([]);
        }
      } catch (err) {
        const errorMsg = err.error || err.message || "Failed to fetch dashboard data";
        if (err.status === 403) {
          setError("Access denied. You do not have permission to view this data.");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested students object
    if (name.startsWith("students.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        students: {
          ...formData.students,
          [field]: parseInt(value) || 0,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTeacherSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, accompanyingTeachers: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate total students
      const totalStudents = Object.values(formData.students).reduce((sum, val) => sum + val, 0);
      if (totalStudents <= 0) {
        setError("Please add at least one student");
        setFormLoading(false);
        return;
      }

      // Accompanying teachers validation is now optional if teachers list is unavailable
      // Only validate if teachers list is available and none selected
      if (teachers.length > 0 && formData.accompanyingTeachers.length === 0) {
        setError("Please select at least one accompanying teacher");
        setFormLoading(false);
        return;
      }

      // Prepare form data - if teachers list is empty, accompanyingTeachers might be names
      const bookingData = {
        ...formData,
        // Ensure accompanyingTeachers is always an array
        accompanyingTeachers: Array.isArray(formData.accompanyingTeachers) 
          ? formData.accompanyingTeachers 
          : [],
      };

      await bookingService.bookBus(bookingData);
      setSuccess("Booking created successfully! Awaiting approval.");
      setFormData({
        purpose: "",
        venue: "",
        tripDate: "",
        departureTime: "",
        returnTime: "",
        students: { form1: 0, form2: 0, form3: 0, form4: 0 },
        accompanyingTeachers: [],
      });
      setShowBookingForm(false);

      // Refresh bookings
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.bookings || []);
      // Refresh dashboard
      const dashData = await dashboardService.getDashboard("teacher", user._id);
      setDashboardData(dashData);
    } catch (err) {
      setError(err.error || err.message || "Failed to create booking");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingService.cancelBooking(bookingId);
      setSuccess("Booking cancelled successfully");

      // Refresh bookings
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.bookings || []);
      // Refresh dashboard
      const dashData = await dashboardService.getDashboard("teacher", user._id);
      setDashboardData(dashData);
      setSuccess("Booking cancelled successfully");
    } catch (err) {
      setError(err.error || err.message || "Failed to cancel booking");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="teacher-dashboard">
      <h2>Teacher Dashboard</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{dashboardData.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Trips</h3>
          <p className="stat-number">{dashboardData.upcomingBookings?.length || 0}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn-primary"
          onClick={() => setShowBookingForm(!showBookingForm)}
        >
          {showBookingForm ? "Hide Booking Form" : "Create New Booking"}
        </button>
      </div>

      {showBookingForm && (
        <div className="booking-form-container">
          <h3>Create New Booking Request</h3>
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purpose">Purpose *</label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., School Competition"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., National Stadium"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tripDate">Trip Date *</label>
                <input
                  type="date"
                  id="tripDate"
                  name="tripDate"
                  value={formData.tripDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="departureTime">Departure Time *</label>
                <input
                  type="time"
                  id="departureTime"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="returnTime">Return Time *</label>
                <input
                  type="time"
                  id="returnTime"
                  name="returnTime"
                  value={formData.returnTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Number of Students by Form</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="students.form1">Form 1</label>
                  <input
                    type="number"
                    id="students.form1"
                    name="students.form1"
                    value={formData.students.form1}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="students.form2">Form 2</label>
                  <input
                    type="number"
                    id="students.form2"
                    name="students.form2"
                    value={formData.students.form2}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="students.form3">Form 3</label>
                  <input
                    type="number"
                    id="students.form3"
                    name="students.form3"
                    value={formData.students.form3}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="students.form4">Form 4</label>
                  <input
                    type="number"
                    id="students.form4"
                    name="students.form4"
                    value={formData.students.form4}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
              <p className="form-hint">
                Total Students: {Object.values(formData.students).reduce((sum, val) => sum + val, 0)}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="accompanyingTeachers">
                Accompanying Teachers {teachers.length === 0 ? "(Optional)" : "*"}
              </label>
              {teachers.length === 0 ? (
                <div style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    Teacher list unavailable. You can still create a booking without selecting accompanying teachers.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter teacher names or IDs (comma-separated)"
                    value={formData.accompanyingTeachers.join(', ')}
                    onChange={(e) => {
                      const names = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setFormData({ ...formData, accompanyingTeachers: names });
                    }}
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              ) : (
                <>
                  <select
                    id="accompanyingTeachers"
                    name="accompanyingTeachers"
                    multiple
                    value={formData.accompanyingTeachers}
                    onChange={handleTeacherSelection}
                    size="5"
                    required
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} {teacher.teacherId ? `(ID: ${teacher.teacherId})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="form-hint">Hold Ctrl/Cmd to select multiple teachers</p>
                </>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={formLoading}
              >
                {formLoading ? "Submitting..." : "Submit Booking Request"}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowBookingForm(false)}
                disabled={formLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bookings-section">
        <h3>My Booking Requests</h3>
        {bookings.length === 0 ? (
          <p className="no-bookings">No bookings yet. Create your first booking request!</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
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
                    <p><strong>Assigned Buses:</strong> {booking.buses.map(b => b.busNumber).join(', ')}</p>
                  )}
                  {booking.status === "PRINCIPAL_APPROVED" && booking.driverAcknowledged && (
                    <p className="trip-status"><strong>🚍 Trip is set to go!</strong></p>
                  )}
                </div>
                <div className="booking-actions">
                  {["PENDING", "REJECTED"].includes(booking.status) && (
                    <button 
                      className="btn-danger"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;