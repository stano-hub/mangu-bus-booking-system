import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import userService from '../../../services/userService';
import Loader from '../../../components/layout/Loader';
import '../admin.css'; // Co-located CSS

const ManageTeachers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    teacherId: ''
  });
  const [editTeacherId, setEditTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeachers = async () => {
    if (!user || user.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllTeachers();
      setTeachers(data.teachers || []);
    } catch (err) {
      const errorMsg = err.error || err.message || 'Failed to load teachers';
      if (err.status === 403) {
        setError('Access denied. You do not have permission to view teachers.');
      } else if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editTeacherId) {
        await userService.updateUser(editTeacherId, {
          ...formData,
          password: formData.password || undefined // Exclude password if empty
        });
        setSuccess('Teacher updated successfully');
      } else {
        await userService.addUser(formData);
        setSuccess('Teacher added successfully');
      }
      setFormData({ name: '', email: '', password: '', role: 'teacher', teacherId: '' });
      setEditTeacherId(null);
      fetchTeachers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (teacher) => {
    setEditTeacherId(teacher._id);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      role: teacher.role,
      teacherId: teacher.teacherId
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await userService.deleteUser(id);
      setSuccess('Teacher deleted successfully');
      fetchTeachers();
    } catch (err) {
      setError(err.message || 'Failed to delete teacher');
    }
  };

  const handleCancelEdit = () => {
    setEditTeacherId(null);
    setFormData({ name: '', email: '', password: '', role: 'teacher', teacherId: '' });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Loader />
      </div>
    );
  }

  return (
    <div className="manage-teachers">
      <h2 className="manage-teachers__title">
        {editTeacherId ? 'Edit Teacher' : 'Manage Teachers'}
      </h2>
      {success && <p className="manage-teachers__success">{success}</p>}
      {error && <p className="manage-teachers__error">{error}</p>}
      <form onSubmit={handleSubmit} className="manage-teachers__form">
        <label htmlFor="name">
          Name
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., John Doe"
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
            required
            placeholder="e.g., john@example.com"
          />
        </label>
        <label htmlFor="password">
          {editTeacherId ? 'New Password (optional)' : 'Password'}
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required={!editTeacherId}
          />
        </label>
        <label htmlFor="teacherId">
          Teacher ID
          <input
            type="text"
            id="teacherId"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            required
            placeholder="e.g., TCH-001"
          />
        </label>
        <div className="manage-teachers__form-buttons">
          <button
            type="submit"
            className="manage-teachers__submit-btn"
            disabled={!formData.name || !formData.email || !formData.teacherId}
          >
            {editTeacherId ? 'Update Teacher' : 'Add Teacher'}
          </button>
          {editTeacherId && (
            <button
              type="button"
              className="manage-teachers__cancel-btn"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      {teachers.length === 0 ? (
        <div className="manage-teachers__empty">
          <p>No teachers found.</p>
          <button
            className="manage-teachers__back-btn"
            onClick={() => navigate('/admin')}
            aria-label="Back to admin panel"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="manage-teachers__table-container">
          <table
            className="manage-teachers__table"
            role="grid"
            aria-label="Teacher management table"
          >
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Teacher ID</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="teacher-row">
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.teacherId}</td>
                  <td>
                    <button
                      className="manage-teachers__edit-btn"
                      onClick={() => handleEdit(teacher)}
                      aria-label={`Edit teacher ${teacher.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="manage-teachers__delete-btn"
                      onClick={() => handleDelete(teacher._id)}
                      aria-label={`Delete teacher ${teacher.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        className="manage-teachers__back-btn"
        onClick={() => navigate('/admin')}
        aria-label="Back to admin panel"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ManageTeachers;