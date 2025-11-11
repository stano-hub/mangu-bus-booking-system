// src/features/driver/components/ExtraBuses.jsx
import React, { useState } from "react";
import driverService from "../../../services/driverService";
import "../driver.css";

const ExtraBuses = ({ extraBuses, onUpdate }) => {
  const [addingBus, setAddingBus] = useState(null);
  const [formData, setFormData] = useState({ busNumber: '', capacity: '', description: '' });

  const handleAddExtraBus = async (bookingId) => {
    if (!formData.busNumber || !formData.capacity) {
      alert("Please fill in bus number and capacity");
      return;
    }

    setAddingBus(bookingId);
    try {
      await driverService.addExtraBus(bookingId, formData);
      setFormData({ busNumber: '', capacity: '', description: '' });
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.error || err.message || "Failed to add extra bus");
    } finally {
      setAddingBus(null);
    }
  };

  if (!extraBuses || extraBuses.length === 0) {
    return (
      <div className="driver-section">
        <h3>Extra Buses</h3>
        <p className="empty">No extra buses needed.</p>
      </div>
    );
  }

  return (
    <div className="driver-section">
      <h3>Extra Buses</h3>
      {extraBuses.map((booking) => (
        <div key={booking._id} style={{ marginBottom: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h4>{booking.purpose} - {booking.venue}</h4>
          <p>Date: {new Date(booking.tripDate).toLocaleDateString()}</p>
          
          {booking.extraBuses && booking.extraBuses.length > 0 && (
            <table className="driver-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Bus Number</th>
                  <th>Capacity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {booking.extraBuses.map((bus, idx) => (
                  <tr key={idx}>
                    <td>{bus.busNumber}</td>
                    <td>{bus.capacity} seats</td>
                    <td>{bus.description || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '4px' }}>
            <h5>Add Extra Bus</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <input
                type="text"
                placeholder="Bus Number"
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                min="1"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <button
                className="driver-btn approve"
                onClick={() => handleAddExtraBus(booking._id)}
                disabled={addingBus === booking._id}
              >
                {addingBus === booking._id ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExtraBuses;
