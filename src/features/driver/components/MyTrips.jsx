// src/features/driver/components/MyTrips.jsx
import React, { useState } from "react";
import driverService from "../../../services/driverService";
import "../driver.css";

const MyTrips = ({ trips, onUpdate }) => {
  const [acknowledging, setAcknowledging] = useState(null);

  const handleAcknowledge = async (bookingId) => {
    setAcknowledging(bookingId);
    try {
      await driverService.acknowledgeTrip(bookingId);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.error || err.message || "Failed to acknowledge trip");
    } finally {
      setAcknowledging(null);
    }
  };

  if (!trips || trips.length === 0) {
    return (
      <div className="driver-section">
        <h3>My Trips</h3>
        <p className="empty">No trips assigned.</p>
      </div>
    );
  }

  return (
    <div className="driver-section">
      <h3>My Trips</h3>
      <table className="driver-table">
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Venue</th>
            <th>Date</th>
            <th>Departure</th>
            <th>Return</th>
            <th>Buses</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip._id}>
              <td>{trip.purpose}</td>
              <td>{trip.venue}</td>
              <td>{new Date(trip.tripDate).toLocaleDateString()}</td>
              <td>{trip.departureTime}</td>
              <td>{trip.returnTime}</td>
              <td>
                {trip.buses && trip.buses.length > 0
                  ? trip.buses.map(b => b.busNumber || b.name).join(', ')
                  : 'Not Assigned'}
              </td>
              <td>
                <span className={`status-badge status-${trip.status?.toLowerCase().replace('_', '-')}`}>
                  {trip.status || 'Pending'}
                </span>
              </td>
              <td>
                {trip.status === 'PRINCIPAL_APPROVED' && !trip.driverAcknowledged && (
                  <button
                    className="driver-btn approve"
                    onClick={() => handleAcknowledge(trip._id)}
                    disabled={acknowledging === trip._id}
                  >
                    {acknowledging === trip._id ? "Processing..." : "Acknowledge"}
                  </button>
                )}
                {trip.driverAcknowledged && (
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Acknowledged</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyTrips;
