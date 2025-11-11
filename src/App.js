import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import AuthPage from "./pages/AuthPage";
import NotFound from "./components/errors/NotFound";
import ProfilePage from "./pages/ProfilePage";

import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminPanel from "./features/admin/components/AdminPanel";
import ManageTeachers from "./features/admin/components/ManageTeachers";
import ManageBuses from "./features/admin/components/ManageBuses";
import AllBookings from "./features/admin/components/AllBookings";
import DeputyDashboard from "./features/deputy/pages/DeputyDashboard";
import DriverDashboard from "./features/driver/pages/DriverDashboard";
import PrincipalDashboard from "./features/principal/pages/PrincipalDashboard";
import TeacherDashboard from "./features/teacher/pages/TeacherDashboard";

import { useAuth } from './context/AuthContext';
import "./styles/App.css";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  
  if (roles && !roles.includes(user.role)) {
    // Don't redirect, show error message instead
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: '#f8f9fa',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          You do not have permission to access this page.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to={`/${user.role}`} replace /> : <AuthPage />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["teacher", "admin", "driver", "deputy", "principal"]}>
              <ProfilePage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-teachers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-buses"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ManageBuses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/all-bookings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AllBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admin-panel"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deputy"
          element={
            <ProtectedRoute roles={["deputy"]}>
              <DeputyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <ProtectedRoute roles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/principal"
          element={
            <ProtectedRoute roles={["principal"]}>
              <PrincipalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
