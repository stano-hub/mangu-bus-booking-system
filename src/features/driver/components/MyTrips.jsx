import React from "react";
import { Link } from "react-router-dom";
import "../driver.css";

const MyTrips = ({ trips, onUpdate }) => {

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
      <div className="bookings-grid">
        {trips.map((trip) => (
          <Link 
            to={`/shared/view-booking/${trip._id}`} 
            key={trip._id} 
            className="booking-card clickable"
          >
            <div className="booking-card__header">
              <h4>{trip.purpose}</h4>
              <span className={`status-badge status-${trip.status?.toLowerCase().replace('_', '-')}`}>
                {trip.status || 'Pending'}
              </span>
            </div>

            <div className="booking-card__content">
              <div className="info-row">
                <span className="label">Destination:</span>
                <span className="value">{trip.venue}</span>
              </div>
              <div className="info-row">
                <span className="label">Trip Date:</span>
                <span className="value">{new Date(trip.tripDate).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Bus:</span>
                <span className="value">
                  {trip.buses && trip.buses.length > 0
                    ? trip.buses.map(b => b.registrationNumber).join(', ')
                    : 'Not Assigned'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Departure:</span>
                <span className="value">{trip.departureTime}</span>
              </div>
            </div>
            
            <div className="view-details-hint">
              {trip.status === 'PRINCIPAL_APPROVED' && !trip.driverAcknowledged 
                ? "⚠ Click to Acknowledge →" 
                : "Click for details →"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyTrips;
