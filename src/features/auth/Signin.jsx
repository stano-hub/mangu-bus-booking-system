// src/features/auth/Signin.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const Signin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Logic to determine if identifier is email or teacherId
      const isEmail = formData.identifier.includes('@');
      const loginPayload = isEmail 
        ? { email: formData.identifier, password: formData.password }
        : { teacherId: formData.identifier, password: formData.password };

      const res = await authService.signin(loginPayload);
      login(res.user, res.token);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/${res.user.role}`);
      }, 1000);
    } catch (err) {
      setError(err.error || err.message || 'Signin failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-header">
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Welcome to Mang'u High School Bus System</p>

      {error && <div className="profile__error">{error}</div>}
      {success && <div className="profile__success">Successfully signed in!</div>}

      <form onSubmit={handleSubmit} className="profile__form">
        <div className="form-group">
          <label htmlFor="identifier">Email or Teacher Code</label>
          <div className="input-wrapper">
            <HiUser className="input-icon" />
            <input
              id="identifier"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter email or teacher code"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <HiLockClosed className="input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="profile__submit-btn"
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? (
            <div className="profile__loading">
              <div className="profile__spinner" /> Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default Signin;