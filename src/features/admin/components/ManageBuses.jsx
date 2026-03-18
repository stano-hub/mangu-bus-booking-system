import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import busService from '../../../services/busService';
import Loader from '../../../components/layout/Loader';
import '../admin.css'; // Co-located CSS

const ManageBuses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({ registrationNumber: '', capacity: '', description: '' });
  const [editBusId, setEditBusId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBuses = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      setError('Access denied. Admin role required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await busService.getAllBuses();
      setBuses(data.buses || []);
    } catch (err) {
      const errorMsg = err.error || err.message || 'Failed to fetch buses';
      if (err.status === 403) {
        setError('Access denied. You do not have permission to view buses.');
      } else if (err.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.capacity <= 0) {
      setError('Capacity must be a positive number');
      return;
    }
    try {
      if (editBusId) {
        await busService.updateBus(editBusId, formData);
        setSuccess('Bus updated successfully');
      } else {
        await busService.addBus(formData);
        setSuccess('Bus added successfully');
      }
      setFormData({ registrationNumber: '', capacity: '', description: '' });
      setEditBusId(null);
      fetchBuses();
    } catch (err) {
      setError(err.error || err.message || 'Operation failed');
    }
  };

  const handleEdit = (bus) => {
    setEditBusId(bus._id);
    setFormData({ registrationNumber: bus.registrationNumber, capacity: bus.capacity, description: bus.description || '' });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    try {
      await busService.deleteBus(id);
      setSuccess('Bus deleted successfully');
      fetchBuses();
    } catch (err) {
      setError(err.error || err.message || 'Failed to delete bus');
    }
  };

  const handleCancelEdit = () => {
    setEditBusId(null);
    setFormData({ registrationNumber: '', capacity: '', description: '' });
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
    <div className="manage-buses">
      <h2 className="manage-buses__title">{editBusId ? 'Edit Bus' : 'Manage Buses'}</h2>
      {success && <p className="manage-buses__success">{success}</p>}
      {error && <p className="manage-buses__error">{error}</p>}
      <form onSubmit={handleSubmit} className="manage-buses__form">
        <label htmlFor="registrationNumber">
          Registration Number
          <input
            type="text"
            id="registrationNumber"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
            placeholder="e.g., KDG 595C"
          />
        </label>
        <label htmlFor="description">
          Description
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="e.g., Uhuru bus"
          />
        </label>
        <label htmlFor="capacity">
          Capacity
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 50"
          />
        </label>
        <div className="manage-buses__form-buttons">
          <button
            type="submit"
            className="manage-buses__submit-btn"
            disabled={!formData.registrationNumber || !formData.capacity || !formData.description}
          >
            {editBusId ? 'Update Bus' : 'Add Bus'}
          </button>
          {editBusId && (
            <button
              type="button"
              className="manage-buses__cancel-btn"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      {buses.length === 0 ? (
        <div className="manage-buses__empty">
          <p>No buses found.</p>
          <button
            className="manage-buses__back-btn"
            onClick={() => navigate('/admin')}
            aria-label="Back to admin panel"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="manage-buses__table-container">
          <table
            className="manage-buses__table"
            role="grid"
            aria-label="Bus management table"
          >
            <thead>
              <tr>
                <th scope="col">Registration Number</th>
                <th scope="col">Description</th>
                <th scope="col">Capacity</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus._id} className="bus-row">
                  <td>{bus.registrationNumber}</td>
                  <td>{bus.description}</td>
                  <td>{bus.capacity}</td>
                  <td>
                    <button
                      className="manage-buses__edit-btn"
                      onClick={() => handleEdit(bus)}
                      aria-label={`Edit bus ${bus.registrationNumber}`}
                    >
                      Edit
                    </button>
                    <button
                      className="manage-buses__delete-btn"
                      onClick={() => handleDelete(bus._id)}
                      aria-label={`Delete bus ${bus.registrationNumber}`}
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
        className="manage-buses__back-btn"
        onClick={() => navigate('/admin')}
        aria-label="Back to admin panel"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ManageBuses;