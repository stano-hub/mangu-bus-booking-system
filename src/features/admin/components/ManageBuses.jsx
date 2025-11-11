import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import busService from '../../../services/busService';
import Loader from '../../../components/layout/Loader';
import '../admin.css'; // Co-located CSS

const ManageBuses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({ busNumber: '', capacity: '' });
  const [editBusId, setEditBusId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBuses = async () => {
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
  };

  useEffect(() => {
    fetchBuses();
  }, [user, navigate]);

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
      setFormData({ busNumber: '', capacity: '' });
      setEditBusId(null);
      fetchBuses();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (bus) => {
    setEditBusId(bus._id);
    setFormData({ busNumber: bus.busNumber, capacity: bus.capacity });
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
      setError(err.message || 'Failed to delete bus');
    }
  };

  const handleCancelEdit = () => {
    setEditBusId(null);
    setFormData({ busNumber: '', capacity: '' });
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
        <label htmlFor="busNumber">
          Bus Number
          <input
            type="text"
            id="busNumber"
            name="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            required
            placeholder="e.g., BUS-001"
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
            disabled={!formData.busNumber || !formData.capacity}
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
                <th scope="col">Bus Number</th>
                <th scope="col">Capacity</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus._id} className="bus-row">
                  <td>{bus.busNumber}</td>
                  <td>{bus.capacity}</td>
                  <td>
                    <button
                      className="manage-buses__edit-btn"
                      onClick={() => handleEdit(bus)}
                      aria-label={`Edit bus ${bus.busNumber}`}
                    >
                      Edit
                    </button>
                    <button
                      className="manage-buses__delete-btn"
                      onClick={() => handleDelete(bus._id)}
                      aria-label={`Delete bus ${bus.busNumber}`}
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