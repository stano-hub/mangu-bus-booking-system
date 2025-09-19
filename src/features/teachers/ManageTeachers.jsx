import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import './teachers.css';

const ManageTeachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'teacher' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse position for face animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Reset success animation and message after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Fetch teachers on mount
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getAllTeachers();
      // Validate and log invalid teacher data
      const validTeachers = data.filter((t) => {
        if (!t.name || !t.email) {
          console.warn('Invalid teacher data:', t);
          return false;
        }
        return true;
      });
      setTeachers(validTeachers);
      setFilteredTeachers(validTeachers);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Search filter with null checks
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredTeachers(
      teachers.filter(
        (t) =>
          (t.name || '').toLowerCase().includes(lowerQuery) ||
          (t.email || '').toLowerCase().includes(lowerQuery) ||
          (t.phone || '').toLowerCase().includes(lowerQuery)
      )
    );
  }, [searchQuery, teachers]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      setSubmitting(false);
      return;
    }
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) {
      setError('Phone number must be 7-15 digits, optional + prefix');
      setSubmitting(false);
      return;
    }

    try {
      await teacherService.addTeacher({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role
      });
      setSuccess('Teacher added successfully');
      setFormData({ name: '', email: '', phone: '', role: 'teacher' });
      setIsSuccess(true);
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await teacherService.deleteTeacher(id);
      setSuccess('Teacher deleted successfully');
      setIsSuccess(true);
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher');
    }
  };

  return (
    <div className="teachers-container">
      <div className="teachers" data-success={isSuccess}>
        <div className="auth-face">
          <div className="face-eyes">
            <div
              className="eye left"
              style={{
                transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 10}px, ${(mousePos.y / window.innerHeight - 0.5) * 10}px)`
              }}
            ></div>
            <div
              className="eye right"
              style={{
                transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 10}px, ${(mousePos.y / window.innerHeight - 0.5) * 10}px)`
              }}
            ></div>
          </div>
          <div className="face-mouth"></div>
        </div>
        <h2 className="teachers__title">Manage Teachers</h2>
        {loading ? (
          <div className="teachers__loading">
            <span className="teachers__spinner"></span>
            <p>Loading teachers...</p>
          </div>
        ) : (
          <>
            {success && <p className="teachers__success">{success}</p>}
            {error && <p className="teachers__error">{error}</p>}
            <form className="teachers__form" onSubmit={handleAddTeacher} role="form" aria-label="Add teacher form">
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                  aria-label="Teacher name"
                />
              </label>
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  aria-label="Teacher email"
                />
              </label>
              <label htmlFor="phone">
                Phone (optional)
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +254712345678"
                  aria-label="Teacher phone"
                />
              </label>
              <label htmlFor="role">
                Role
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  aria-label="Teacher role"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="teachers__buttons">
                <button
                  type="submit"
                  className="teachers__submit-btn"
                  disabled={submitting}
                  aria-label="Add teacher"
                >
                  {submitting ? <span className="teachers__spinner">Adding...</span> : 'Add Teacher'}
                </button>
                <button
                  type="button"
                  className="teachers__back-btn"
                  onClick={() => navigate('/admin-panel')}
                  aria-label="Back to admin panel"
                >
                  Back
                </button>
              </div>
            </form>
            <div className="teachers__search">
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search teachers"
              />
            </div>
            <div className="teachers__list" role="region" aria-label="Teachers list">
              {filteredTeachers.length === 0 ? (
                <p className="teachers__empty">No teachers found</p>
              ) : (
                <div className="teachers__cards">
                  {filteredTeachers.map((t) => (
                    <div key={t._id} className="teachers__card">
                      <h3>{t.name || 'N/A'}</h3>
                      <p>Email: {t.email || 'N/A'}</p>
                      <p>Phone: {t.phone || 'N/A'}</p>
                      <p>Role: {t.role || 'N/A'}</p>
                      <button
                        className="teachers__delete-btn"
                        onClick={() => handleDeleteTeacher(t._id)}
                        aria-label={`Delete teacher ${t.name || 'unknown'}`}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageTeachers;