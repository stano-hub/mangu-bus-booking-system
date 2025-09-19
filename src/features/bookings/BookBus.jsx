import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import busService from '../../services/busService';
import './bookings.css';

const BookBus = () => {
  const navigate = useNavigate();
  const [availableBuses, setAvailableBuses] = useState([]);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [formData, setFormData] = useState({
    busId: '',
    travelDate: '',
    purpose: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Fetch available buses when travelDate changes
  useEffect(() => {
    const fetchBuses = async () => {
      if (!formData.travelDate) return;
      setLoadingBuses(true);
      try {
        const buses = await busService.getAvailableBuses(formData.travelDate);
        setAvailableBuses(buses);
        setError('');
      } catch (err) {
        setAvailableBuses([]);
        setError(err.message || 'Failed to fetch available buses');
      } finally {
        setLoadingBuses(false);
      }
    };
    fetchBuses();
  }, [formData.travelDate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate travelDate (no past dates)
    const selectedDate = new Date(formData.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Travel date cannot be in the past');
      return;
    }

    try {
      const res = await bookingService.bookBus(formData);
      setMessage(res.message || 'Bus booked successfully!');
      setIsSuccess(true);
      setFormData({ busId: '', travelDate: '', purpose: '' });
      setAvailableBuses([]);
    } catch (err) {
      setError(err.message || 'Failed to book bus');
    }
  };

  const handleCancel = () => {
    setFormData({ busId: '', travelDate: '', purpose: '' });
    setAvailableBuses([]);
    setMessage('');
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="book-bus" data-success={isSuccess}>
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
        <h2 className="book-bus__title">Book a Bus</h2>
        {message && <p className="book-bus__success">{message}</p>}
        {error && <p className="book-bus__error">{error}</p>}
        <form onSubmit={handleSubmit} className="book-bus__form" role="form" aria-label="Book a bus form">
          <label htmlFor="travelDate">
            Travel Date
            <input
              type="date"
              id="travelDate"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              required
              aria-label="Select travel date"
            />
          </label>
          <label htmlFor="busId">
            Select Bus
            {loadingBuses ? (
              <span className="book-bus__spinner">Loading buses...</span>
            ) : availableBuses.length === 0 && formData.travelDate ? (
              <p className="book-bus__no-buses">No buses available for this date</p>
            ) : (
              <select
                id="busId"
                name="busId"
                value={formData.busId}
                onChange={handleChange}
                required
                disabled={!formData.travelDate || availableBuses.length === 0}
                aria-label="Select a bus"
              >
                <option value="">-- Select Bus --</option>
                {availableBuses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.name} ({bus.capacity} seats)
                  </option>
                ))}
              </select>
            )}
          </label>
          <label htmlFor="purpose">
            Purpose
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="e.g., School trip"
              required
              aria-label="Purpose of the trip"
            />
          </label>
          <div className="book-bus__buttons">
            <button
              type="submit"
              className="book-bus__submit-btn"
              disabled={loadingBuses || !formData.busId}
              aria-label="Book the bus"
            >
              {loadingBuses ? <span className="spinner"></span> : 'Book Bus'}
            </button>
            <button
              type="button"
              className="book-bus__cancel-btn"
              onClick={handleCancel}
              aria-label="Cancel booking"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookBus;