import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Signin from './components/Signin';
import Signup from './components/Signup';
import BookBus from './components/BookBus';
import MyBookings from './components/MyBookings';
import AllBookings from './components/AllBookings';
import AdminPanel from './components/AdminPanel';
import AddBus from './components/AddBus';
import ManageTeachers from './components/ManageTeachers';
import Profile from './components/Profile';
import './styles/App.css';

// Axios instance with credentials
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

const ProtectedRoute = ({ user, requiredRole = null, children }) => {
  const navigate = useNavigate();
  if (user === null) return <div className="text-center mt-10">Loading...</div>;
  if (!user) {
    navigate('/signin');
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    navigate('/dashboard');
    return null;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null); // null: loading, false: unauthenticated, object: authenticated
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get('/api/profile');
        setUser(res.data.teacher || false);
        setError(null);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(false);
        setError('Failed to verify authentication. Please try again.');
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="app">
      <Navbar user={user} setUser={setUser} />
      {error && <div className="text-red-500 text-center">{error}</div>}
      {user === null ? (
        <div className="app__loading">
          <div className="app__spinner"></div>
        </div>
      ) : (
        <Routes>
          <Route path="/signin" element={<Signin setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-bus"
            element={
              <ProtectedRoute user={user}>
                <BookBus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute user={user}>
                <MyBookings user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-bookings"
            element={
              <ProtectedRoute user={user}>
                <AllBookings user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-bus"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AddBus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-teachers"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <ManageTeachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;