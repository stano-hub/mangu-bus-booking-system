// src/features/shared/bookings/components/BookBus.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import bookingService from "../../../../services/bookingService";
import userService from "../../../../services/userService";
import "../bookings.css";

const BookBus = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
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
    buses: [],
    extraBuses: [],
    comments: [],
  });
  // UI helpers for array inputs
  const [busesCsv, setBusesCsv] = useState("");
  const [extraBusesCsv, setExtraBusesCsv] = useState("");
  const [commentsText, setCommentsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teacherWarning, setTeacherWarning] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await userService.getAllTeachers();
        setTeachers(data.teachers || []);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    if (user) fetchTeachers();
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
      setTeacherWarning("Some selected teachers don’t have valid IDs and were ignored.");
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
      // Validate total students
      const totalStudents = Object.values(formData.students).reduce((sum, val) => sum + val, 0);
      if (totalStudents <= 0) {
        setError("Please add at least one student");
        setLoading(false);
        return;
      }

      // Validate date is not in the past
      const selectedDate = new Date(formData.tripDate);
      if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
        setError("Trip date cannot be in the past");
        setLoading(false);
        return;
      }

      // Validate times order
      if (formData.departureTime && formData.returnTime && formData.returnTime <= formData.departureTime) {
        setError("Return time must be after departure time");
        setLoading(false);
        return;
      }

      // Build arrays from UI fields
      const buses = busesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const extraBuses = extraBusesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const comments = commentsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        purpose: formData.purpose,
        venue: formData.venue,
        tripDate: formData.tripDate,
        departureTime: formData.departureTime,
        returnTime: formData.returnTime,
        students: { ...formData.students },
        totalStudents,
        accompanyingTeachers: formData.accompanyingTeachers,
        buses,
        extraBuses,
        comments,
      };

      await bookingService.bookBus(payload);
      setSuccess("Booking created successfully! Awaiting approval.");
      setFormData({
        purpose: "",
        venue: "",
        tripDate: "",
        departureTime: "",
        returnTime: "",
        students: { form1: 0, form2: 0, form3: 0, form4: 0 },
        accompanyingTeachers: [],
        buses: [],
        extraBuses: [],
        comments: [],
      });
      setBusesCsv("");
      setExtraBusesCsv("");
      setCommentsText("");
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
            Buses (comma separated IDs)
            <input
              type="text"
              name="busesCsv"
              value={busesCsv}
              onChange={(e) => setBusesCsv(e.target.value)}
              placeholder="e.g., BUS01,BUS07"
            />
          </label>

          <label>
            Extra Buses (comma separated IDs)
            <input
              type="text"
              name="extraBusesCsv"
              value={extraBusesCsv}
              onChange={(e) => setExtraBusesCsv(e.target.value)}
              placeholder="optional"
            />
          </label>

          <label>
            Comments (one per line)
            <textarea
              name="commentsText"
              value={commentsText}
              onChange={(e) => setCommentsText(e.target.value)}
              rows={4}
              placeholder="Any notes or requirements..."
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
            <h3>Number of Students by Form</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <label>
                Form 1
                <input
                  type="number"
                  name="students.form1"
                  value={formData.students.form1}
                  onChange={handleChange}
                  min="0"
                />
              </label>
              <label>
                Form 2
                <input
                  type="number"
                  name="students.form2"
                  value={formData.students.form2}
                  onChange={handleChange}
                  min="0"
                />
              </label>
              <label>
                Form 3
                <input
                  type="number"
                  name="students.form3"
                  value={formData.students.form3}
                  onChange={handleChange}
                  min="0"
                />
              </label>
              <label>
                Form 4
                <input
                  type="number"
                  name="students.form4"
                  value={formData.students.form4}
                  onChange={handleChange}
                  min="0"
                />
              </label>
            </div>
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
