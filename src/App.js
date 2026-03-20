import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import AuthPage from "./pages/AuthPage";
import NotFound from "./components/errors/NotFound";
import ProfilePage from "./pages/ProfilePage";
import OfflineIndicator from "./components/common/OfflineIndicator";

import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminPanel from "./features/admin/components/AdminPanel";
import ManageTeachers from "./features/admin/components/ManageTeachers";
import ManageBuses from "./features/admin/components/ManageBuses";
import ManageClassesPage from "./features/admin/pages/ManageClassesPage";
import AllBookings from "./features/admin/components/AllBookings";
import DeputyDashboard from "./features/deputy/pages/DeputyDashboard";
import PendingBookingsPage from "./features/deputy/pages/PendingBookingsPage";
import DriverDashboard from "./features/driver/pages/DriverDashboard";
import PrincipalDashboard from "./features/principal/pages/PrincipalDashboard";
import TeacherDashboard from "./features/teacher/pages/TeacherDashboard";
import BookBusPage from "./features/teacher/pages/BookBusPage";
import EditBookingPage from "./features/teacher/pages/EditBookingPage";
import ResubmitBookingPage from "./features/teacher/pages/ResubmitBookingPage";
import BookingDetailsPage from "./features/shared/bookings/pages/BookingDetailsPage";

import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import "./styles/App.css";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><p>Loading...</p></div>;
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#dc3545' }}>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><p>Loading...</p></div>;
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <OfflineIndicator />
      {user && <Navbar />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to={`/${user.role}`} replace /> : <AuthPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/manage-teachers" element={<ProtectedRoute roles={["admin"]}><ManageTeachers /></ProtectedRoute>} />
        <Route path="/admin/manage-classes" element={<ProtectedRoute roles={["admin"]}><ManageClassesPage /></ProtectedRoute>} />
        <Route path="/admin/manage-buses" element={<ProtectedRoute roles={["admin"]}><ManageBuses /></ProtectedRoute>} />
        <Route path="/admin/all-bookings" element={<ProtectedRoute roles={["admin"]}><AllBookings /></ProtectedRoute>} />
        <Route path="/admin/admin-panel" element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/deputy" element={<ProtectedRoute roles={["deputy"]}><DeputyDashboard /></ProtectedRoute>} />
        <Route path="/deputy/pending-bookings" element={<ProtectedRoute roles={["deputy"]}><PendingBookingsPage /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute roles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/principal" element={<ProtectedRoute roles={["principal"]}><PrincipalDashboard /></ProtectedRoute>} />
        <Route path="/principal/all-bookings" element={<ProtectedRoute roles={["principal"]}><AllBookings /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute roles={["teacher"]}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/book" element={<ProtectedRoute roles={["teacher"]}><BookBusPage /></ProtectedRoute>} />
        <Route path="/teacher/edit-booking/:bookingId" element={<ProtectedRoute roles={["teacher"]}><EditBookingPage /></ProtectedRoute>} />
        <Route path="/teacher/resubmit-booking/:bookingId" element={<ProtectedRoute roles={["teacher"]}><ResubmitBookingPage /></ProtectedRoute>} />
        <Route path="/shared/view-booking/:bookingId" element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>} />
        <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/auth" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
