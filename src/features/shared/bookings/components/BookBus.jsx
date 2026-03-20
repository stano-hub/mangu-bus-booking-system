import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import bookingService from "../../../../services/bookingService";
import userService from "../../../../services/userService";
import classService from "../../../../services/classService";
import { sanitizeBookingInput } from "../../../../utils/sanitize";
import "../bookings.css";

const BookBus = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    purpose: "",
    venue: "",
    tripDate: "",
    departureTime: "",
    returnTime: "",
    students: {},
    accompanyingTeachers: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teacherWarning, setTeacherWarning] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersData, classesData] = await Promise.all([
          userService.getAllTeachers(),
          classService.getAllClasses()
        ]);
        setTeachers(teachersData.teachers || []);
        
        const fetchedClasses = classesData.classes || [];
        setClasses(fetchedClasses);
        
        const initialStudents = {};
        fetchedClasses.forEach(c => {
          initialStudents[c.name] = 0;
        });
        
        setFormData(prev => ({
          ...prev,
          students: initialStudents
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    const oidRegex = /^[a-f\d]{24}$/i;
    const valid = selectedOptions.filter((v) => oidRegex.test(v));
    if (valid.length !== selectedOptions.length) {
      setTeacherWarning("Some selected teachers don't have valid IDs and were ignored.");
    } else {
      setTeacherWarning("");
    }
    setFormData({ ...formData, accompanyingTeachers: valid });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const sanitizedData = sanitizeBookingInput(formData);
      
      const totalStudents = Object.values(sanitizedData.students).reduce((sum, val) => sum + val, 0);
      if (totalStudents <= 0) {
        setError("Please add at least one student");
        setLoading(false);
        return;
      }

      const selectedDate = new Date(sanitizedData.tripDate);
      if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
        setError("Trip date cannot be in the past");
        setLoading(false);
        return;
      }

      if (sanitizedData.departureTime && sanitizedData.returnTime && sanitizedData.returnTime <= sanitizedData.departureTime) {
        setError("Return time must be after departure time");
        setLoading(false);
        return;
      }

      await bookingService.bookBus(sanitizedData);
      setSuccess("Booking created successfully! Awaiting approval.");
      
      const resetStudents = {};
      classes.forEach(c => resetStudents[c.name] = 0);
      
      setFormData({
        purpose: "",
        venue: "",
        tripDate: "",
        departureTime: "",
        returnTime: "",
        students: resetStudents,
        accompanyingTeachers: [],
      });
    } catch (err) {
      setError(err.error || err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = Object.values(formData.students).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bookings-container">
      <div className="book-bus">
        <h2 className="book-bus__title">Book a Bus</h2>

        {error && <p className="book-bus__error">{error}</p>}
        {success && <p className="book-bus__success">{success}</p>}

        <form onSubmit={handleSubmit} className="book-bus__form">
          <label>
            Purpose
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g., Educational trip"
              required
            />
          </label>

          <label>
            Venue/Destination
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., National Museum"
              required
            />
          </label>

          <label>
            Trip Date
            <input
              type="date"
              name="tripDate"
              value={formData.tripDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </label>

          <label>
            Departure Time
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Return Time
            <input
              type="time"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleChange}
              required
            />
          </label>

          <div className="students-section">
            <h3>Number of Students by Class</h3>
            {classes.length === 0 ? (
              <p>No classes available. Please contact admin.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {classes.map(c => (
                  <label key={c._id}>
                    {c.name}
                    <input
                      type="number"
                      name={`students.${c.name}`}
                      value={formData.students[c.name] || 0}
                      onChange={handleChange}
                      min="0"
                    />
                  </label>
                ))}
              </div>
            )}
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
              Total Students: {totalStudents}
            </p>
          </div>

          <label>
            Accompanying Teachers
            <select
              multiple
              value={formData.accompanyingTeachers}
              onChange={handleTeacherSelection}
              style={{ minHeight: '100px' }}
            >
              {teachers.map((teacher) => (
                <option
                  key={teacher._id || teacher.teacherId || teacher.id}
                  value={teacher._id || ''}
                  disabled={!teacher._id}
                >
                  {teacher.name}
                  {teacher.teacherId ? ` (${teacher.teacherId})` : ''}
                  {!teacher._id ? ' — unavailable' : ''}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple teachers</small>
            {teacherWarning && (
              <div style={{ color: '#b45309', marginTop: '0.35rem' }}>{teacherWarning}</div>
            )}
          </label>

          <div className="book-bus__buttons">
            <button
              type="submit"
              className="book-bus__submit-btn"
              disabled={loading || totalStudents === 0}
            >
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookBus;
