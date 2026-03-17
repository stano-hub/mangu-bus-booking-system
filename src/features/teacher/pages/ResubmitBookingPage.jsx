import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import bookingService from "../../../services/bookingService";
import userService from "../../../services/userService";
import { useAuth } from "../../../context/AuthContext";
import "../teacher.css";

const ResubmitBookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [teachers, setTeachers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTeacherSearch, setShowTeacherSearch] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch teachers and booking data
        const [teachersRes, bookingRes] = await Promise.all([
          userService.getAllTeachers(),
          bookingService.getMyBookings(),
        ]);

        if (teachersRes.success) {
          setTeachers(teachersRes.teachers || []);
        }

        if (bookingRes.success) {
          const booking = bookingRes.bookings.find((b) => b._id === bookingId);
          if (booking) {
            // Check if booking can be resubmitted
            if (booking.status !== "REJECTED") {
              toast.error("Only rejected bookings can be resubmitted");
              navigate("/teacher");
              return;
            }

            // Format date for input
            const tripDate = new Date(booking.tripDate);
            const formattedDate = tripDate.toISOString().split("T")[0];

            setFormData({
              purpose: booking.purpose || "",
              venue: booking.venue || "",
              tripDate: formattedDate,
              departureTime: booking.departureTime || "",
              returnTime: booking.returnTime || "",
              students: {
                form1: booking.students?.form1 || 0,
                form2: booking.students?.form2 || 0,
                form3: booking.students?.form3 || 0,
                form4: booking.students?.form4 || 0,
              },
              accompanyingTeachers: booking.accompanyingTeachers?.map((t) =>
                typeof t === "object" ? t._id : t
              ) || [],
            });
          } else {
            toast.error("Booking not found");
            navigate("/teacher");
          }
        }
      } catch (err) {
        toast.error(err.error || err.message || "Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, bookingId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("students.")) {
      const field = name.split(".")[1];
      const numValue = value === "" ? 0 : parseInt(value, 10);
      setFormData({
        ...formData,
        students: {
          ...formData.students,
          [field]: numValue,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addTeacher = (teacherId) => {
    if (!formData.accompanyingTeachers.includes(teacherId)) {
      setFormData({
        ...formData,
        accompanyingTeachers: [...formData.accompanyingTeachers, teacherId],
      });
    }
    setTeacherSearchQuery("");
    setShowTeacherSearch(false);
  };

  const removeTeacher = (teacherId) => {
    setFormData({
      ...formData,
      accompanyingTeachers: formData.accompanyingTeachers.filter(
        (id) => id !== teacherId
      ),
    });
  };

  const getSelectedTeachers = () => {
    return teachers.filter((t) =>
      formData.accompanyingTeachers.includes(t._id)
    );
  };

  const getAvailableTeachers = () => {
    return teachers.filter(
      (t) =>
        !formData.accompanyingTeachers.includes(t._id) &&
        (t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
          t.teacherId?.toLowerCase().includes(teacherSearchQuery.toLowerCase()))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const totalStudents = Object.values(formData.students).reduce(
        (sum, val) => sum + val,
        0
      );
      if (totalStudents <= 0) {
        toast.error("Please add at least one student");
        setFormLoading(false);
        return;
      }

      if (formData.accompanyingTeachers.length === 0 && teachers.length > 0) {
        toast.error("Please select at least one accompanying teacher");
        setFormLoading(false);
        return;
      }

      // Validate return time is after departure time
      if (formData.departureTime && formData.returnTime) {
        const [depHours, depMinutes] = formData.departureTime
          .split(":")
          .map(Number);
        const [retHours, retMinutes] = formData.returnTime
          .split(":")
          .map(Number);
        const departureMinutes = depHours * 60 + depMinutes;
        const returnMinutes = retHours * 60 + retMinutes;

        if (returnMinutes <= departureMinutes) {
          toast.error("Return time must be after departure time");
          setFormLoading(false);
          return;
        }
      }

      const bookingData = {
        ...formData,
        totalStudents,
      };

      const res = await bookingService.resubmitBooking(bookingId, bookingData);

      if (res.success) {
        toast.success("Booking resubmitted successfully!");
        navigate("/teacher");
      }
    } catch (err) {
      toast.error(err.error || err.message || "Failed to resubmit booking");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="dashboard-content">
          <div className="loading">Loading booking data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Resubmit Booking Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purpose">Purpose *</label>
              <input
                id="purpose"
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g., Educational trip to museum"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue *</label>
              <input
                id="venue"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., National Museum"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tripDate">Trip Date *</label>
              <input
                id="tripDate"
                type="date"
                name="tripDate"
                value={formData.tripDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="departureTime">Departure Time *</label>
              <input
                id="departureTime"
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="returnTime">Return Time *</label>
              <input
                id="returnTime"
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Students by Form *</label>
            <div className="students-grid">
              <div className="student-input">
                <label htmlFor="students.form1">Form 1</label>
                <input
                  id="students.form1"
                  type="number"
                  name="students.form1"
                  value={formData.students.form1}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="student-input">
                <label htmlFor="students.form2">Form 2</label>
                <input
                  id="students.form2"
                  type="number"
                  name="students.form2"
                  value={formData.students.form2}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="student-input">
                <label htmlFor="students.form3">Form 3</label>
                <input
                  id="students.form3"
                  type="number"
                  name="students.form3"
                  value={formData.students.form3}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="student-input">
                <label htmlFor="students.form4">Form 4</label>
                <input
                  id="students.form4"
                  type="number"
                  name="students.form4"
                  value={formData.students.form4}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              Accompanying Teachers {teachers.length === 0 ? "(Optional)" : "*"}
            </label>
            {teachers.length === 0 ? (
              <div className="teacher-list-unavailable">
                <p>
                  Teacher list unavailable. Accompanying teachers selection is
                  disabled.
                </p>
                <input
                  type="text"
                  placeholder="No teachers available"
                  value=""
                  disabled
                />
              </div>
            ) : (
              <div className="teacher-selection-container">
                {formData.accompanyingTeachers.length > 0 && (
                  <div className="selected-teachers-list">
                    <h4>Selected Teachers:</h4>
                    {getSelectedTeachers().map((teacher) => (
                      <div key={teacher._id} className="selected-teacher-tag">
                        <span>
                          {teacher.name}{" "}
                          {teacher.teacherId ? `(${teacher.teacherId})` : ""}
                        </span>
                        <button
                          type="button"
                          className="remove-teacher-btn"
                          onClick={() => removeTeacher(teacher._id)}
                          title="Remove teacher"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!showTeacherSearch ? (
                  <button
                    type="button"
                    className="btn-secondary add-teacher-btn"
                    onClick={() => setShowTeacherSearch(true)}
                  >
                    + Add a Teacher
                  </button>
                ) : (
                  <div className="teacher-search-interface">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={teacherSearchQuery}
                      onChange={(e) => setTeacherSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {teacherSearchQuery && (
                      <div className="teacher-search-results">
                        {getAvailableTeachers().length === 0 ? (
                          <p className="no-results">No teachers found</p>
                        ) : (
                          getAvailableTeachers().map((teacher) => (
                            <button
                              key={teacher._id}
                              type="button"
                              className="teacher-option"
                              onClick={() => addTeacher(teacher._id)}
                            >
                              {teacher.name}{" "}
                              {teacher.teacherId
                                ? `(${teacher.teacherId})`
                                : ""}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn-secondary cancel-search-btn"
                      onClick={() => {
                        setShowTeacherSearch(false);
                        setTeacherSearchQuery("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={formLoading}
            >
              {formLoading ? "Resubmitting..." : "Resubmit Booking Request"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/teacher")}
              disabled={formLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResubmitBookingPage;
