import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/BookBus.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

const BookBus = () => {
  const [availableBuses, setAvailableBuses] = useState([]);
  const [travelDate, setTravelDate] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch available buses when travel date changes
  useEffect(() => {
    if (travelDate) {
      const fetchAvailableBuses = async () => {
        try {
          const response = await axiosInstance.get(`/api/buses/available?date=${travelDate}`);
          setAvailableBuses(response.data);
          setSelectedBus('');
          setSelectedBuses([]);
          setError('');
        } catch (err) {
          const message = err.response?.data?.error || 'Failed to fetch available buses';
          setError(message);
          setAvailableBuses([]);
          if (err.response?.status === 401) {
            navigate('/signin');
          }
        }
      };
      fetchAvailableBuses();
    }
  }, [travelDate, navigate]);

  // Add a bus to the selected buses list
  const handleAddBus = () => {
    if (!selectedBus) {
      setError('Please select a bus to add.');
      return;
    }
    const bus = availableBuses.find(b => b.registration_number === selectedBus);
    if (bus && !selectedBuses.some(b => b.registration_number === selectedBus)) {
      setSelectedBuses([...selectedBuses, bus]);
      setSelectedBus('');
      setError('');
    } else if (selectedBuses.some(b => b.registration_number === selectedBus)) {
      setError('This bus is already added.');
    }
  };

  // Remove a bus from the selected buses list
  const handleRemoveBus = (registration_number) => {
    setSelectedBuses(selectedBuses.filter(b => b.registration_number !== registration_number));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate inputs
    if (!purpose.trim()) {
      setError('Purpose is required.');
      setLoading(false);
      return;
    }
    if (!selectedBuses.length) {
      setError('At least one bus must be added.');
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (travelDate < today) {
      setError('Travel date must be in the future.');
      setLoading(false);
      return;
    }

    try {
      // Send a separate booking request for each selected bus
      for (const bus of selectedBuses) {
        await axiosInstance.post('/api/bookings', {
          bus_registration: bus.registration_number,
          travel_date: travelDate,
          purpose
        });
      }
      setSuccess('All bookings created successfully!');
      setTravelDate('');
      setSelectedBuses([]);
      setPurpose('');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create bookings';
      setError(message);
      if (err.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-bus">
      <h2 className="book-bus__title">Book a Bus</h2>
      {error && <p className="book-bus__error">{error}</p>}
      {success && <p className="book-bus__success">{success}</p>}
      <form onSubmit={handleSubmit} className="book-bus__form">
        <div className="book-bus__form-group">
          <label htmlFor="travelDate" className="book-bus__label">
            Travel Date
          </label>
          <input
            type="date"
            id="travelDate"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="book-bus__input"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="book-bus__form-group">
          <label htmlFor="busRegistration" className="book-bus__label">
            Select Bus
          </label>
          <div className="book-bus__bus-selection">
            <select
              id="busRegistration"
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="book-bus__input"
              disabled={!availableBuses.length || loading}
            >
              <option value="">Select a bus</option>
              {availableBuses.map((bus) => (
                <option key={bus.registration_number} value={bus.registration_number}>
                  {bus.registration_number} (Capacity: {bus.capacity})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="book-bus__add-button"
              onClick={handleAddBus}
              disabled={!selectedBus || loading}
            >
              Add Bus
            </button>
          </div>
        </div>
        {selectedBuses.length > 0 && (
          <div className="book-bus__selected-buses">
            <h3 className="book-bus__subtitle">Selected Buses</h3>
            <ul className="book-bus__bus-list">
              {selectedBuses.map((bus) => (
                <li key={bus.registration_number} className="book-bus__bus-item">
                  {bus.registration_number} (Capacity: {bus.capacity})
                  <button
                    type="button"
                    className="book-bus__remove-button"
                    onClick={() => handleRemoveBus(bus.registration_number)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="book-bus__form-group">
          <label htmlFor="purpose" className="book-bus__label">
            Purpose
          </label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="book-bus__textarea"
            placeholder="Enter the purpose of the trip"
            required
          />
        </div>
        <button
          type="submit"
          className="book-bus__submit"
          disabled={loading || !selectedBuses.length || !travelDate || !purpose}
        >
          {loading ? (
            <>
              <span className="book-bus__spinner"></span> Booking...
            </>
          ) : (
            'Book Buses'
          )}
        </button>
      </form>
    </div>
  );
};

export default BookBus;