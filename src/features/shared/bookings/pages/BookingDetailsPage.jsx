import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import bookingService from "../../../../services/bookingService";
import deputyService from "../../../../services/deputyService";
import principalService from "../../../../services/principalService";
import driverService from "../../../../services/driverService";
import busService from "../../../../services/busService";
import { useAuth } from "../../../../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../bookings.css";

const BookingDetailsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [comment, setComment] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showExtraBusForm, setShowExtraBusForm] = useState(false);
  const [extraBusData, setExtraBusData] = useState({ busNumber: '', capacity: '', description: '' });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getBookingById(bookingId);
        if (res.success) {
          setBooking(res.booking);
        }
      } catch (err) {
        toast.error(err.error || err.message || "Failed to load booking details");
        if (user) navigate(`/${user.role}`);
      } finally {
        setLoading(false);
      }
    };

    if (user && bookingId) fetchBooking();
  }, [user, bookingId, navigate]);

  useEffect(() => {
    const fetchBuses = async () => {
      if (user?.role === 'deputy') {
        try {
          const res = await busService.getAllBuses();
          if (res.success) setAvailableBuses(res.buses || []);
        } catch (err) {
          console.error("Failed to fetch buses", err);
        }
      }
    };
    fetchBuses();
  }, [user]);

  const handleAction = async (actionFn, successMsg, redirectPath = null) => {
    setActionLoading(true);
    try {
      console.log('Executing action...');
      await actionFn();
      console.log('Action completed successfully');
      toast.success(successMsg);
      
      if (redirectPath) {
        setTimeout(() => navigate(redirectPath), 1500);
        return;
      }

      // Refresh booking data
      const res = await bookingService.getBookingById(bookingId);
      if (res.success) {
        setBooking(res.booking);
        setShowApprovalForm(false);
        setShowRejectionForm(false);
        setComment("");
        setSelectedBuses([]);
      }
    } catch (err) {
      console.error('Action failed:', err);
      const errorMessage = err.error || err.message || "Action failed";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = () => {
    if (!booking) return;
    
    const doc = new jsPDF();
    const primaryColor = [30, 58, 138]; // #1e3a8a
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Mang'u High School", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Bus Booking Details", 105, 30, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 37, { align: "center" });
    
    // Draw Line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // 1. General Information
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("General Information", 14, 52);
    
    autoTable(doc, {
      startY: 55,
      head: [['Field', 'Value']],
      body: [
        ['Purpose', booking.purpose],
        ['Venue', booking.venue],
        ['Trip Date', new Date(booking.tripDate).toLocaleDateString()],
        ['Departure Time', booking.departureTime],
        ['Return Time', booking.returnTime],
        ['Requested By', booking.createdBy?.name || 'N/A'],
        ['Status', booking.status]
      ],
      theme: 'striped',
      headStyles: { fill: primaryColor },
      styles: { fontSize: 10 }
    });

    // 2. Student Breakdown
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Student Breakdown", 14, doc.lastAutoTable.finalY + 15);
    
    const studentBreakdownKeys = Object.keys(booking.students || {});
    const headRow = [...studentBreakdownKeys, 'Total'];
    const bodyRow = [
      ...studentBreakdownKeys.map(key => booking.students[key] || 0),
      booking.totalStudents || 0
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [headRow],
      body: [bodyRow],
      theme: 'grid',
      headStyles: { fill: primaryColor },
      styles: { halign: 'center' }
    });

    // 3. Teachers & Buses
    let currentY = doc.lastAutoTable.finalY + 15;
    
    // Accompanying Teachers
    if (booking.accompanyingTeachers?.length > 0) {
      doc.setFontSize(14);
      doc.text("Accompanying Teachers", 14, currentY);
      autoTable(doc, {
        startY: currentY + 3,
        head: [['#', 'Name', 'Teacher ID']],
        body: booking.accompanyingTeachers.map((t, i) => [i + 1, t.name, t.teacherId || 'N/A']),
        theme: 'plain',
        styles: { fontSize: 10 }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Assigned Buses
    if (booking.buses?.length > 0) {
      doc.setFontSize(14);
      doc.text("Assigned Buses", 14, currentY);
      autoTable(doc, {
        startY: currentY + 3,
        head: [['Reg Number', 'Capacity', 'Description']],
        body: booking.buses.map(b => [b.registrationNumber, b.capacity, b.description || 'N/A']),
        theme: 'plain',
        styles: { fontSize: 10 }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Extra Buses
    if (booking.extraBuses?.length > 0) {
      doc.setFontSize(14);
      doc.text("Extra Buses", 14, currentY);
      autoTable(doc, {
        startY: currentY + 3,
        head: [['Bus Number', 'Capacity', 'Description']],
        body: booking.extraBuses.map(b => [b.busNumber, b.capacity, b.description || 'N/A']),
        theme: 'plain',
        styles: { fontSize: 10 }
      });
    }

    doc.save(`booking_details_${booking._id}.pdf`);
    toast.success("Successfully generated PDF");
  };

  const teacherActions = (
    <div className="action-group">
      {(booking?.status === 'PENDING' || booking?.status === 'REJECTED') && (
        <>
          <button 
            className="btn-action-primary"
            onClick={() => navigate(booking.status === 'REJECTED' ? `/teacher/resubmit-booking/${booking._id}` : `/teacher/edit-booking/${booking._id}`)}
          >
            {booking.status === 'REJECTED' ? '📝 Resubmit' : '✏️ Edit'}
          </button>
          <button 
            className="btn-action-danger"
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel this booking?")) {
                handleAction(() => bookingService.cancelBooking(booking._id), "Booking cancelled");
              }
            }}
          >
            ❌ Cancel Request
          </button>
        </>
      )}
    </div>
  );

  const deputyActions = (
    <div className="action-section">
      {(booking?.status === 'PENDING' || booking?.status === 'DEPUTY_REVIEW') && !showApprovalForm && !showRejectionForm && (
        <div className="action-group">
          <button className="btn-action-primary" onClick={() => setShowApprovalForm(true)}>
            {booking?.status === 'DEPUTY_REVIEW' ? '✅ Re-approve & Set to Approved' : '✅ Approve & Assign Buses'}
          </button>
          <button className="btn-action-danger" onClick={() => setShowRejectionForm(true)}>❌ Reject</button>
        </div>
      )}

      {showApprovalForm && (
        <div className="action-form">
          <h4>Review & Approve</h4>
          <div className="bus-selection">
            <label>Select Buses</label>
            <div className="bus-selection-chips">
              {selectedBuses.map(busId => {
                const bus = availableBuses.find(b => b._id === busId);
                return (
                  <div key={busId} className="bus-chip">
                    {bus?.registrationNumber}
                    <button onClick={() => setSelectedBuses(selectedBuses.filter(id => id !== busId))}>×</button>
                  </div>
                );
              })}
            </div>
            <select 
              value="" 
              onChange={(e) => {
                if (e.target.value && !selectedBuses.includes(e.target.value)) {
                  setSelectedBuses([...selectedBuses, e.target.value]);
                }
              }}
            >
              <option value="">Choose a bus...</option>
              {availableBuses.filter(b => b.isActive && !selectedBuses.includes(b._id)).map(bus => (
                <option key={bus._id} value={bus._id}>{bus.registrationNumber} ({bus.capacity} seats)</option>
              ))}
            </select>
          </div>
          <div className="action-group">
            <button 
              className="btn-action-primary" 
              disabled={selectedBuses.length === 0 || actionLoading}
              onClick={() => handleAction(
                () => deputyService.approveBooking(booking._id, { buses: selectedBuses }), 
                "Booking approved successfully",
                "/deputy"
              )}
            >
              Confirm Approval
            </button>
            <button className="btn-action-secondary" onClick={() => setShowApprovalForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showRejectionForm && (
        <div className="action-form">
          <h4>Reject Booking</h4>
          <label>Reason for Rejection</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Explain why the booking is rejected..." required />
          <div className="action-group">
            <button 
              className="btn-action-danger" 
              disabled={!comment.trim() || actionLoading}
              onClick={() => handleAction(
                () => deputyService.rejectBooking(booking._id, comment), 
                "Booking rejected successfully",
                "/deputy"
              )}
            >
              Confirm Rejection
            </button>
            <button className="btn-action-secondary" onClick={() => setShowRejectionForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  const principalActions = (
    <div className="action-section">
      {booking?.status === 'DEPUTY_APPROVED' && !showApprovalForm && !showRejectionForm && (
        <div className="action-group">
          <button className="btn-action-primary" onClick={() => setShowApprovalForm(true)}>✅ Final Approval</button>
          <button className="btn-action-danger" onClick={() => setShowRejectionForm(true)}>❌ Reject</button>
        </div>
      )}

      {showApprovalForm && (
        <div className="action-form">
          <h4>Final Approval</h4>
          <div className="action-group">
            <button 
              className="btn-action-primary" 
              disabled={actionLoading}
              onClick={() => handleAction(
                () => principalService.approveBooking(booking._id, ""), 
                "Trip authorized successfully",
                "/principal"
              )}
            >
              Authorize Trip
            </button>
            <button className="btn-action-secondary" onClick={() => setShowApprovalForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showRejectionForm && (
        <div className="action-form">
          <h4>Reject Booking</h4>
          <label>Reason for Rejection</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Explain why the booking is rejected..." required />
          <div className="action-group">
            <button 
              className="btn-action-danger" 
              disabled={!comment.trim() || actionLoading}
              onClick={() => handleAction(
                () => principalService.rejectBooking(booking._id, comment), 
                "Booking rejected successfully",
                "/principal"
              )}
            >
              Confirm Rejection
            </button>
            <button className="btn-action-secondary" onClick={() => setShowRejectionForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  const driverActions = (
    <div className="action-section">
      <div className="action-group">
        {booking?.status === 'PRINCIPAL_APPROVED' && !booking?.driverAcknowledged && (
            <button 
              className="btn-action-primary"
              disabled={actionLoading}
              onClick={() => handleAction(
                () => driverService.acknowledgeTrip(booking._id), 
                "Trip acknowledged successfully",
                "/driver"
              )}
            >
              🚍 Acknowledge Trip
            </button>
        )}
        {booking?.driverAcknowledged && <span className="status-badge status-driver-acknowledged">✓ Trip Acknowledged</span>}
        
        {(booking?.status === 'PRINCIPAL_APPROVED' || booking?.status === 'DRIVER_ACKNOWLEDGED') && (
          <button 
            className="btn-action-secondary"
            onClick={() => setShowExtraBusForm(!showExtraBusForm)}
          >
            {showExtraBusForm ? "Close Extra Bus Form" : "➕ Add Extra Bus"}
          </button>
        )}
      </div>

      {showExtraBusForm && (
        <div className="action-form">
          <h4>Add Extra Bus</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Bus Number</label>
              <input 
                type="text" 
                placeholder="e.g. EXTRA-01" 
                value={extraBusData.busNumber}
                onChange={(e) => setExtraBusData({ ...extraBusData, busNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input 
                type="number" 
                placeholder="Seats" 
                value={extraBusData.capacity}
                onChange={(e) => setExtraBusData({ ...extraBusData, capacity: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>Description (Optional)</label>
              <textarea 
                placeholder="e.g. Borrowed from partner school" 
                value={extraBusData.description}
                onChange={(e) => setExtraBusData({ ...extraBusData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="action-group">
            <button 
              className="btn-action-primary"
              disabled={!extraBusData.busNumber || !extraBusData.capacity || actionLoading}
              onClick={() => handleAction(async () => {
                await driverService.addExtraBus(booking._id, extraBusData);
                setShowExtraBusForm(false);
                setExtraBusData({ busNumber: '', capacity: '', description: '' });
              }, "Extra bus added successfully")}
            >
              Confirm Add Bus
            </button>
            <button className="btn-action-secondary" onClick={() => setShowExtraBusForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="dashboard-content">
          <div className="loading">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="teacher-dashboard">
        <div className="dashboard-content">
          <div className="error">Booking not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-content">
        <div className="details-header">
          <div className="header-actions">
            <button onClick={() => navigate(-1)} className="btn-back">
              ← Back
            </button>
          </div>
          {user?.role === 'teacher' && booking.status === 'REJECTED' && (
            <button className="btn-resubmit" onClick={() => navigate(`/teacher/resubmit-booking/${bookingId}`)}>
              Edit & Resubmit
            </button>
          )}

          {user?.role === 'admin' && booking.status === 'CANCELLED' && (
            <button 
              className="btn-delete-large" 
              onClick={async () => {
                if (window.confirm("Are you sure you want to permanently delete this cancelled booking? This action cannot be undone.")) {
                  try {
                    await bookingService.deleteBookingAdmin(bookingId);
                    toast.success("Booking permanently deleted");
                    navigate('/admin/all-bookings');
                  } catch (err) {
                    toast.error(err.error || "Failed to delete booking");
                  }
                }
              }}
              style={{ padding: '0.8rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Permanently Delete Booking
            </button>
          )}
          <div className="header-title">
            <h2>Booking Details</h2>
            <span className={`status-badge status-${booking.status.toLowerCase().replace('_', '-')}`}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="details-card">
          <section className="details-section">
            <h3>General Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Purpose</label>
                <p>{booking.purpose}</p>
              </div>
              <div className="detail-item">
                <label>Venue</label>
                <p>{booking.venue}</p>
              </div>
              <div className="detail-item">
                <label>Trip Date</label>
                <p>{booking.tripDate ? new Date(booking.tripDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Requested By</label>
                <p>{booking.createdBy?.name || 'Unknown'}</p>
              </div>
              <div className="detail-item">
                <label>Departure Time</label>
                <p>{booking.departureTime}</p>
              </div>
              <div className="detail-item">
                <label>Return Time</label>
                <p>{booking.returnTime}</p>
              </div>
              {booking.attachments?.length > 0 && user?.role !== 'driver' && (
                <div className="detail-item full-width">
                  <label>📁 Attached Documents</label>
                  <div className="attachments-list">
                    {booking.attachments.map((doc, idx) => (
                      <a 
                        key={idx}
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="attachment-link"
                        style={{ display: 'block', marginBottom: '0.5rem' }}
                      >
                        View {doc.name || `Document ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {booking.documentUrl && user?.role !== 'driver' && (
                <div className="detail-item full-width">
                  <label>📁 Attached Document (Legacy)</label>
                  <a 
                    href={booking.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="attachment-link"
                  >
                    View {booking.documentName || "Document"}
                  </a>
                </div>
              )}
              {!booking.attachments?.length && !booking.documentUrl && user?.role !== 'driver' && (
                <div className="detail-item full-width">
                  <label>📁 Attached Documents</label>
                  <p className="no-attachments-msg">No documents attached to this booking.</p>
                </div>
              )}
            </div>
          </section>

          <section className="details-section">
            <h3>Student Breakdown</h3>
            <div className="students-stats">
              {Object.keys(booking.students || {}).map(className => (
                <div key={className} className="stat-box">
                  <label>{className}</label>
                  <span>{booking.students[className] || 0}</span>
                </div>
              ))}
              <div className="stat-box total">
                <label>Total</label>
                <span>{booking.totalStudents}</span>
              </div>
            </div>
          </section>

          <section className="details-section">
            <h3>Accompanying Teachers</h3>
            {booking.accompanyingTeachers?.length > 0 ? (
              <ul className="teachers-list">
                {booking.accompanyingTeachers.map((t) => (
                  <li key={t._id}>
                    {t.name} {t.teacherId ? `(${t.teacherId})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No accompanying teachers selected.</p>
            )}
          </section>

          {booking.buses?.length > 0 && (
            <section className="details-section">
              <h3>Assigned Buses</h3>
              <ul className="buses-list">
                {booking.buses.map((bus) => (
                  <li key={bus._id} className="bus-detail-item">
                    <div className="bus-main">
                      <strong>{bus.registrationNumber}</strong>
                      {bus.description && <span className="bus-desc"> - {bus.description}</span>}
                    </div>
                    <div className="bus-capacity">
                      Capacity: {bus.capacity} seats
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {booking.extraBuses?.length > 0 && (
            <section className="details-section">
              <h3>Extra Buses</h3>
              <div className="extra-buses-grid">
                {booking.extraBuses.map((bus, idx) => (
                  <div key={idx} className="extra-bus-card">
                    <div className="bus-info">
                      <span className="bus-number">{bus.busNumber}</span>
                      <span className="bus-capacity">{bus.capacity} seats</span>
                    </div>
                    {bus.description && <p className="bus-desc">{bus.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

        <section className="details-section">
            <h3>Comments History</h3>
            
            {booking.comments?.length > 0 ? (
              <div className="comments-timeline">
                {[...booking.comments].reverse().map((comment, index) => (
                  <div key={index} className="comment-bubble">
                    <div className="comment-meta">
                      <span className="comment-role">{comment.role}</span>
                      <span className="comment-date">
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="comment-message">{comment.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data" style={{ marginBottom: '1.5rem' }}>No comments yet.</p>
            )}

            {/* Add Comment Box */}
            <div className="add-comment-box" style={{ marginTop: '1.5rem' }}>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="Write a comment..."
                disabled={actionLoading}
              />
              <button 
                className="btn-action-primary" 
                disabled={!comment.trim() || actionLoading}
                onClick={() => handleAction(async () => {
                  await bookingService.addComment(booking._id, comment);
                  setComment("");
                }, "Comment posted")}
              >
                Post Comment
              </button>
            </div>
          </section>

          {/* Download Button at the bottom as requested */}
          <div className="download-section-bottom">
            <button 
              className="btn-download-large"
              onClick={handleDownload}
              disabled={actionLoading}
            >
              📄 Download Booking Report (PDF)
            </button>
            <p className="download-note">Includes all trip details, student breakdown, and assigned assets.</p>
          </div>

          {/* Persistent Action Panel */}
          <div className="details-actions-panel">
            {user?.role === 'teacher' && 
             (booking.createdBy?._id?.toString() === (user._id || user.id)?.toString()) && 
             teacherActions}
            {user?.role === 'deputy' && deputyActions}
            {user?.role === 'principal' && principalActions}
            {user?.role === 'driver' && driverActions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
