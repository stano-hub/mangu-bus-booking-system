// src/features/teacher/pages/BookBusPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import bookingService from "../../../services/bookingService";
import userService from "../../../services/userService";
import classService from "../../../services/classService";
import { useAuth } from "../../../context/AuthContext";
import "../teacher.css";

const BookBusPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
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
    const fetchInitialData = async () => {
      try {
        const teachersData = await userService.getAllTeachers();
        setTeachers(teachersData.teachers || []);
      } catch (err) {
        if (err.status !== 403) {
          console.warn("Could not fetch teachers list:", err);
        }
        setTeachers([]);
      }

      try {
        const classesData = await classService.getAllClasses();
        const activeClasses = classesData.classes || [];
        setClasses(activeClasses);

        const initialStudentsInfo = {};
        activeClasses.forEach(cls => {
          initialStudentsInfo[cls.name] = 0;
        });

        setFormData(prev => ({
          ...prev,
          students: initialStudentsInfo,
        }));
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        toast.error("Failed to load classes for booking form");
      }
    };
    if (user) fetchInitialData();
  }, [user]);

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
      accompanyingTeachers: formData.accompanyingTeachers.filter((id) => id !== teacherId),
    });
  };

  const getSelectedTeachers = () => {
    return teachers.filter((t) => formData.accompanyingTeachers.includes(t._id));
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
      const totalStudents = Object.values(formData.students).reduce((sum, val) => sum + val, 0);
      if (totalStudents <= 0) {
        toast.error("Please add at least one student");
        setFormLoading(false);
        return;
      }

      // Validate return time is after departure time
      if (formData.departureTime && formData.returnTime) {
        const [depHours, depMinutes] = formData.departureTime.split(':').map(Number);
        const [retHours, retMinutes] = formData.returnTime.split(':').map(Number);
        const departureMinutes = depHours * 60 + depMinutes;
        const returnMinutes = retHours * 60 + retMinutes;
        
        if (returnMinutes <= departureMinutes) {
          toast.error("Return time must be after departure time");
          setFormLoading(false);
          return;
        }
      }

      if (teachers.length > 0 && formData.accompanyingTeachers.length === 0) {
        toast.error("Please select at least one accompanying teacher");
        setFormLoading(false);
        return;
      }

      // Upload attachments if any
      let docData = { attachments: [] };
      if (selectedFiles.length > 0) {
        toast.loading(`Uploading ${selectedFiles.length} file(s)...`, { id: "upload" });
        try {
          const uploads = await bookingService.uploadDocuments(selectedFiles);
          docData = { attachments: uploads };
          toast.success("Documents uploaded successfully", { id: "upload" });
        } catch (uploadErr) {
          toast.error("File upload failed, but proceeding with booking...", { id: "upload" });
        }
      }

      const bookingData = {
        ...formData,
        ...docData,
        accompanyingTeachers: teachers.length > 0 && Array.isArray(formData.accompanyingTeachers) 
          ? formData.accompanyingTeachers 
          : [],
      };

      const result = await bookingService.bookBus(bookingData);
      console.log('Booking created successfully:', result);
      toast.success("Booking created successfully! Awaiting approval.");
      
      // Clear success notification after redirect
      setTimeout(() => {
        navigate("/teacher");
      }, 1500);
    } catch (err) {
      console.error('Booking creation error:', err);
      const errorMessage = err.error || err.message || "Failed to create booking";
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <div className="booking-form-page">
        <div className="page-header">
           <h2>Create New Booking Request</h2>
           <button className="btn-secondary" onClick={() => navigate("/teacher")}>
             Back to Dashboard
           </button>
        </div>
        
        <div className="booking-form-container">
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purpose">Trip Purpose *</label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Regional Science Fair"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venue">Destination Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Kenyatta International Convention Centre"
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
              <h4>
                <span>👥</span> Number of Students by Form
              </h4>
              <div className="form-row">
                {classes.length === 0 ? (
                  <p className="no-data-hint" style={{ padding: '0 10px' }}>No active classes found online.</p>
                ) : (
                  classes.map((cls) => (
                    <div className="form-group" key={cls._id}>
                      <label htmlFor={`students.${cls.name}`}>
                         {cls.name}
                      </label>
                      <input
                        type="number"
                        id={`students.${cls.name}`}
                        name={`students.${cls.name}`}
                        value={formData.students[cls.name] === 0 ? "" : (formData.students[cls.name] || "")}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  ))
                )}
              </div>
              <div className="form-hint">
                Total Capacity Needed: {Object.values(formData.students).reduce((sum, val) => sum + (Number(val) || 0), 0)} Students
              </div>
            </div>

            <div className="form-group">
              <label>
                <span>👨‍🏫</span> Accompanying Teachers {teachers.length === 0 ? "(Optional)" : "*"}
              </label>
              
              <div className="teacher-selection-container">
                {/* Selected Teachers List */}
                {formData.accompanyingTeachers.length > 0 ? (
                  <div className="selected-teachers-list">
                    {getSelectedTeachers().map((teacher) => (
                      <div key={teacher._id} className="selected-teacher-tag">
                        <span>{teacher.name} {teacher.teacherId ? `(${teacher.teacherId})` : ""}</span>
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
                ) : (
                  teachers.length > 0 && <p className="no-data-hint">No teachers selected yet.</p>
                )}

                {/* Add Teacher Button or Search Interface */}
                {teachers.length === 0 ? (
                  <div className="teacher-list-unavailable">
                    <p>Teacher list currently unavailable. You can still submit the request.</p>
                  </div>
                ) : (
                  !showTeacherSearch ? (
                    <button
                      type="button"
                      className="btn-secondary add-teacher-btn"
                      onClick={() => setShowTeacherSearch(true)}
                      style={{ marginTop: '0.5rem' }}
                    >
                      + Add Accompanying Teacher
                    </button>
                  ) : (
                    <div className="teacher-search-interface">
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Search Teacher</label>
                        <input
                          type="text"
                          placeholder="Type name or teacher ID..."
                          value={teacherSearchQuery}
                          onChange={(e) => setTeacherSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      <div className="teacher-search-results">
                        {getAvailableTeachers().length === 0 ? (
                          <div className="no-results">No matching teachers found</div>
                        ) : (
                           getAvailableTeachers().map((teacher) => (
                            <button
                              key={teacher._id}
                              type="button"
                              className="teacher-option"
                              onClick={() => addTeacher(teacher._id)}
                            >
                              <strong>{teacher.name}</strong>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                                {teacher.teacherId ? `ID: ${teacher.teacherId}` : ""}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setShowTeacherSearch(false);
                            setTeacherSearchQuery("");
                          }}
                        >
                          Cancel Search
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="form-section">
              <h4>
                <span>📎</span> Attach Documents (Optional)
              </h4>
              <div className="form-group">
                <label htmlFor="attachment">Supporting Documents (PDF, Image, etc.)</label>
                <input
                  type="file"
                  id="attachment"
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
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => navigate("/teacher")}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={formLoading}
              >
                {formLoading ? "Creating Request..." : "Submit Booking Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookBusPage;
