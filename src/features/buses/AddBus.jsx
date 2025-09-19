import React, { useState, useEffect } from 'react';
import busService from '../../services/busService';
import { useNavigate } from 'react-router-dom';
import './buses.css';

const AddBus = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    seats: '',
    route: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
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
        navigate('/admin-panel');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.seats) {
      setError('Bus name and seats are required');
      return;
    }

    setLoading(true);
    try {
      await busService.addBus({
        name: formData.name,
        seats: parseInt(formData.seats),
        route: formData.route
      });
      setSuccess('Bus added successfully');
      setIsSuccess(true);
      setFormData({ name: '', seats: '', route: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="add-bus" data-success={isSuccess}>
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
        <h2 className="add-bus__title">Add a New Bus</h2>
        {success && <p className="add-bus__success">{success}</p>}
        {error && <p className="add-bus__error">{error}</p>}
        <form className="add-bus__form" onSubmit={handleSubmit} role="form" aria-label="Add a new bus form">
          <label htmlFor="name">
            Bus Name
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter bus name"
              aria-label="Bus name"
            />
          </label>
          <label htmlFor="seats">
            Number of Seats
            <input
              type="number"
              id="seats"
              name="seats"
              value={formData.seats}
              onChange={handleChange}
              required
              placeholder="e.g., 40"
              min="1"
              aria-label="Number of seats"
            />
          </label>
          <label htmlFor="route">
            Route (optional)
            <input
              type="text"
              id="route"
              name="route"
              value={formData.route}
              onChange={handleChange}
              placeholder="Enter route"
              aria-label="Bus route"
            />
          </label>
          <button
            type="submit"
            className="add-bus__submit-btn"
            disabled={loading}
            aria-label="Add the bus"
          >
            {loading ? <span className="spinner">Adding...</span> : 'Add Bus'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBus;