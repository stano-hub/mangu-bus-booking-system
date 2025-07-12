import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManageTeachers.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

// Format phone number (assumes Kenyan format, e.g., +254123456789)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  const match = phoneNumber.match(/^\+254(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
};

function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/admin/teachers');
      setTeachers(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch teachers');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleToggleActive = async (teacherId, isActive) => {
    setError('');
    setSuccess('');
    try {
      await axiosInstance.patch(`/admin/teachers/${teacherId}`, { is_active: !isActive });
      setTeachers(
        teachers.map((teacher) =>
          teacher.teacher_id === teacherId ? { ...teacher, is_active: !isActive } : teacher
        )
      );
      setSuccess(`Teacher ${!isActive ? 'reactivated' : 'deactivated'} successfully`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update teacher status');
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher account?')) return;
    setError('');
    setSuccess('');
    try {
      await axiosInstance.delete(`/admin/teachers/${teacherId}`);
      setTeachers(teachers.filter((teacher) => teacher.teacher_id !== teacherId));
      setSuccess('Teacher deleted successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete teacher');
    }
  };

  return (
    <div className="manage-teachers">
      <h2 className="manage-teachers__title">Manage Teachers</h2>
      {error && <div className="manage-teachers__message manage-teachers__message--error">{error}</div>}
      {success && <div className="manage-teachers__message manage-teachers__message--success">{success}</div>}
      {loading ? (
        <div className="manage-teachers__loading">
          <div className="manage-teachers__spinner"></div>
        </div>
      ) : teachers.length === 0 ? (
        <p className="manage-teachers__empty">No teachers found.</p>
      ) : (
        <div className="manage-teachers__table-container">
          <table className="manage-teachers__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.teacher_id}>
                  <td>{teacher.teacher_id}</td>
                  <td>{teacher.first_name}</td>
                  <td>{teacher.last_name}</td>
                  <td>{teacher.email || 'N/A'}</td>
                  <td>{formatPhoneNumber(teacher.phone_number)}</td>
                  <td>{teacher.role}</td>
                  <td className={teacher.is_active ? 'manage-teachers__status--active' : 'manage-teachers__status--inactive'}>
                    {teacher.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td>
                    <button
                      className={
                        teacher.is_active
                          ? 'manage-teachers__button manage-teachers__button--deactivate'
                          : 'manage-teachers__button manage-teachers__button--reactivate'
                      }
                      onClick={() => handleToggleActive(teacher.teacher_id, teacher.is_active)}
                    >
                      {teacher.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button
                      className="manage-teachers__button manage-teachers__button--delete"
                      onClick={() => handleDelete(teacher.teacher_id)}
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
    </div>
  );
}

export default ManageTeachers;