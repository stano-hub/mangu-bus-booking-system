import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddBus.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

function AddBus() {
  const [formData, setFormData] = useState({
    registration_number: '',
    capacity: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { registration_number, capacity } = formData;

    if (!registration_number.trim() || !capacity) {
      setError('Registration number and capacity are required.');
      return;
    }
    if (isNaN(capacity) || parseInt(capacity) <= 0) {
      setError('Capacity must be a positive number.');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/admin/buses', {
        registration_number: registration_number.trim().toUpperCase(),
        capacity: parseInt(capacity),
        description: formData.description.trim(),
        is_active: true
      });

      setLoading(false);
      setSuccess(response.data.message || 'Bus added successfully!');
      setFormData({ registration_number: '', capacity: '', description: '' });
      setTimeout(() => navigate('/admin-panel'), 2000);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.error || 'Failed to add bus');
    }
  };

  return (
    <div className="add-bus-container">
      <h2>Add New Bus</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="add-bus-form">
        <div className="form-group">
          <label htmlFor="registration_number">Registration Number</label>
          <input
            type="text"
            id="registration_number"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
            placeholder="e.g., KDA123X"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="e.g., 60"
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="E.g., Used for school trips or local transport"
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Bus'}
        </button>
      </form>
    </div>
  );
}

export default AddBus;