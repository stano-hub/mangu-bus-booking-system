// src/features/deputy/components/PendingBookings.jsx
import React, { useEffect, useState } from 'react';
import bookingService from '../../../services/bookingService';
import '../deputy.css';

export default function PendingBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getAllBookings(); // fetch all bookings
        const pending = res.bookings.filter(b => b.status === 'PENDING'); // filter client-side
        setPendingBookings(pending);
      } catch (err) {
        setError(err.message || 'Failed to fetch pending bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBookings();
  }, []);

  if (loading) return <p>Loading pending bookings...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="pending-bookings">
      <h2>Pending Bookings</h2>
      {pendingBookings.length === 0 ? (
        <p>No pending bookings</p>
      ) : (
        <table className="pending-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Teacher</th>
              <th>Buses</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map((b) => (
              <tr key={b._id}>
                <td>{b._id}</td>
                <td>{b.createdBy?.name || 'N/A'}</td>
                <td>{b.buses?.map(bus => bus.name).join(', ') || 'None'}</td>
                <td>{new Date(b.tripDate).toLocaleDateString()}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
