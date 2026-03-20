import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import bookingService from "../../../services/bookingService";
import userService from "../../../services/userService";
import classService from "../../../services/classService";
import { useAuth } from "../../../context/AuthContext";
import "../teacher.css";

const EditBookingPage = () => {
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
    students: {},
    accompanyingTeachers: [],
    attachments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch teachers, booking data, and classes
        const [teachersRes, bookingRes, classesRes] = await Promise.all([
          userService.getAllTeachers(),
          bookingService.getMyBookings(),
          classService.getAllClasses()
        ]);

        if (teachersRes.success) {
          setTeachers(teachersRes.teachers || []);
        }

        let fetchedClasses = [];
        if (classesRes.success) {
          fetchedClasses = classesRes.classes || [];
        }

        if (bookingRes.success) {
          const booking = bookingRes.bookings.find((b) => b._id === bookingId);
          if (booking) {
            // Check if booking can be edited
            if (!["PENDING", "REJECTED"].includes(booking.status)) {
              toast.error("This booking cannot be edited");
              navigate("/teacher");
              return;
            }

            // Format date for input
            const tripDate = new Date(booking.tripDate);
            const formattedDate = tripDate.toISOString().split("T")[0];

            const bookingStudents = booking.students || {};
            const activeClassNames = fetchedClasses.map(c => c.name);
            const bookedClassNames = Object.keys(bookingStudents);
            const allClassNames = Array.from(new Set([...activeClassNames, ...bookedClassNames]));
            
            const studentsObj = {};
            allClassNames.forEach(className => {
              studentsObj[className] = bookingStudents[className] || 0;
            });

            setFormData({
              purpose: booking.purpose || "",
              venue: booking.venue || "",
              tripDate: formattedDate,
              departureTime: booking.departureTime || "",
              returnTime: booking.returnTime || "",
              students: studentsObj,
              accompanyingTeachers: booking.accompanyingTeachers?.map((t) =>
                typeof t === "object" ? t._id : t
              ) || [],
              attachments: booking.attachments || [],
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

      // Upload new attachments if any
      let newAttachments = [];
      if (selectedFiles.length > 0) {
        toast.loading(`Uploading ${selectedFiles.length} new file(s)...`, { id: "upload" });
        try {
          newAttachments = await bookingService.uploadDocuments(selectedFiles);
          toast.success("New documents uploaded successfully", { id: "upload" });
        } catch (uploadErr) {
          console.error("Supabase update upload error:", uploadErr);
          toast.error("File upload failed. Update cannot proceed without successful document upload.", { id: "upload" });
          setFormLoading(false);
          return; // STOP HERE
        }
      }

      const bookingData = {
        ...formData,
        attachments: [...formData.attachments, ...newAttachments],
        totalStudents,
      };

      const res = await bookingService.updateBooking(bookingId, bookingData);

      if (res.success) {
        toast.success("Booking updated successfully!");
        navigate("/teacher");
      }
    } catch (err) {
      toast.error(err.error || err.message || "Failed to update booking");
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
          <h2>Edit Booking Request</h2>
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
            <label>Students by Class *</label>
            <div className="students-grid">
              {Object.keys(formData.students).map(className => (
                <div key={className} className="student-input">
                  <label htmlFor={`students.${className}`}>{className}</label>
                  <input
                    id={`students.${className}`}
                    type="number"
                    name={`students.${className}`}
                    value={formData.students[className]}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              ))}
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

          <div className="form-group">
            <label>Attachments (Current)</label>
            {formData.attachments?.length > 0 ? (
              <div className="current-attachments">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="file-info-bar">
                    <p><strong>{file.name}</strong></p>
                    <button type="button" onClick={() => {
                      const updated = formData.attachments.filter((_, i) => i !== idx);
                      setFormData({ ...formData, attachments: updated });
                    }}>Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-hint">No attachments uploaded yet.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="new-attachments">Add More Documents (PDF, Image, etc.)</label>
            <input
              id="new-attachments"
              type="file"
              onChange={(e) => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])}
              className="file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            />
            {selectedFiles.length > 0 && (
              <div className="selected-files-list">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="file-info-bar">
                    <p><strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
                    <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={formLoading}
            >
              {formLoading ? "Updating..." : "Update Booking Request"}
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

export default EditBookingPage;
