// src/features/auth/Signin.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import bgImage from '../../assets/logo.jpeg';

const Signin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await authService.signin({ email: formData.email, password: formData.password });
      login(res.user, res.token);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/${res.user.role}`);
      }, 800);
    } catch (err) {
      setError(err.message || 'Signin failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container signin"
      style={{ ['--auth-bg-image']: `url(${bgImage})` }}
    >
      <motion.div
        className="profile"
        data-success={success}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="auth-title">Signin</h1>

        {error && <p className="profile__error">{error}</p>}
        {success && <p className="profile__success">Signed in successfully!</p>}

        <form onSubmit={handleSubmit} className="profile__form">
          <label>
            email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="panelchris30@gmail.com"
              required
              aria-required="true"
            />
          </label>

          <label>
            password
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                aria-required="true"
              />
              <button
                type="button"
                className="input-eye"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <div className="form-row">
            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <a href="#" className="link-muted">Forgot password?</a>
          </div>

          <div className="profile__buttons">
            <motion.button
              type="submit"
              className="profile__submit-btn"
              disabled={loading}
              whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(31, 97, 255, 0.25)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {loading ? (
                <span className="profile__loading">
                  <span className="profile__spinner"></span> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </div>
        </form>

        
      </motion.div>
    </div>
  );
};

export default Signin;