// src/features/principal/components/ApprovedBookings.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import bookingService from '../../../services/bookingService';
import principalService from '../../../services/principalService';
import Loader from '../../../components/layout/Loader';
import '../principal.css';

export default function ApprovedBookings() {
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApprovedBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingService.getAllBookings();
      // Filter for bookings that are deputy approved (awaiting principal approval)
      const deputyApproved = res.bookings?.filter(
        b => b.status === 'DEPUTY_APPROVED'
      ) || [];
      setApprovedBookings(deputyApproved);
    } catch (err) {
      const msg = err.error || err.message || 'Failed to fetch approved bookings';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    setActionLoading(bookingId);
    setError(null);

    try {
      await principalService.approveBooking(bookingId, '');
      toast.success('Booking approved successfully!');
      // Refresh the list
      await fetchApprovedBookings();
    } catch (err) {
      const msg = err.error || err.message || 'Failed to approve booking';
      setError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;

    setActionLoading(bookingId);
    setError(null);

    try {
      await principalService.rejectBooking(bookingId, 'Rejected by principal');
      toast.success('Booking rejected.');
      // Refresh the list
      await fetchApprovedBookings();
    } catch (err) {
      const msg = err.error || err.message || 'Failed to reject booking';
      setError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="approved-bookings">
      <h2>Deputy-Approved Bookings</h2>
      
      {error && <div className="error-message">{error}</div>}

      {approvedBookings.length === 0 ? (
        <p className="no-bookings">No bookings awaiting your approval.</p>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Purpose</th>
                <th>Destination</th>
                <th>Trip Date</th>
                <th>Bus</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.createdBy?.name || booking.teacherId?.name || 'N/A'}</td>
                  <td>{booking.purpose || 'N/A'}</td>
                  <td>{booking.venue || booking.destination || 'N/A'}</td>
                  <td>
                    {booking.tripDate
                      ? new Date(booking.tripDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </td>
                  <td>
                    {booking.buses && booking.buses.length > 0
                      ? booking.buses.map(b => b.registrationNumber || 'N/A').join(', ')
                      : 'Not Assigned'}
                  </td>
                  <td>
                    <span className="status-badge status-deputy-approved">
                      {booking.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(booking._id)}
                        disabled={actionLoading === booking._id}
                      >
                        {actionLoading === booking._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(booking._id)}
                        disabled={actionLoading === booking._id}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
