import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import Navbar from './components/Navbar';
import Dashboard from './features/dashboard/Dashboard';
import Signin from './features/auth/Signin';
import Signup from './features/auth/Signup';
import BookBus from './features/bookings/BookBus';
import MyBookings from './features/bookings/MyBookings';
import AllBookings from './features/bookings/AllBookings';
import AdminPanel from './features/admin/AdminPanel';
import AddBus from './features/buses/AddBus';
import ManageTeachers from './features/teachers/ManageTeachers';
import Profile from './features/profile/Profile';
import './styles/App.css';
import { Analytics } from "@vercel/analytics/react"

const ProtectedRoute = ({ user, requiredRole = null, children }) => {
  if (user === null) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null); // null = loading, object = authenticated, false = unauthenticated
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingAuth(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('Token on load:', token);
        console.log('Stored user:', storedUser);
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Verify with backend
          try {
            const res = await authService.getProfile();
            if (res.user) {
              setUser(res.user);
              localStorage.setItem('user', JSON.stringify(res.user));
            }
          } catch (verifyErr) {
            console.warn('Profile verification failed, using stored user:', verifyErr.message);
            // Keep stored user if verification fails (e.g., network issue)
          }
        } else {
          setUser(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err.response?.status, err.response?.data);
        setUser(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoadingAuth(false);
      }
    };
    
    fetchUser();
  }, []);

  return (
    <div className="app">
      {user && <Navbar user={user} setUser={setUser} />}
      {error && !user && <div className="text-red-500 text-center">{error}</div>}
      
      {isLoadingAuth ? (
        <div className="app__loading">
          <div className="app__spinner"></div>
        </div>
      ) : (
        <Routes>
          <Route path="/signin" element={<Signin setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute user={user}><Dashboard user={user} /></ProtectedRoute>}
          />
          <Route
            path="/book-bus"
            element={<ProtectedRoute user={user}><BookBus /></ProtectedRoute>}
          />
          <Route
            path="/my-bookings"
            element={<ProtectedRoute user={user}><MyBookings user={user} /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute user={user}><Profile user={user} setUser={setUser} /></ProtectedRoute>}
          />
          <Route
            path="/all-bookings"
            element={<ProtectedRoute user={user} requiredRole="admin"><AllBookings user={user} /></ProtectedRoute>}
          />
          <Route
            path="/admin-panel"
            element={<ProtectedRoute user={user} requiredRole="admin"><AdminPanel /></ProtectedRoute>}
          />
          <Route
            path="/add-bus"
            element={<ProtectedRoute user={user} requiredRole="admin"><AddBus /></ProtectedRoute>}
          />
          <Route
            path="/manage-teachers"
            element={<ProtectedRoute user={user} requiredRole="admin"><ManageTeachers /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/signin'} replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;