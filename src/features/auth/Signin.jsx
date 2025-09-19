import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './auth.css';

const Signin = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse position for face animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Reset success animation after 2 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authService.signin(formData);
      if (data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsSuccess(true);
        // Delay navigation to ensure setUser completes
        setTimeout(() => navigate('/dashboard'), 100);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth" data-success={isSuccess}>
        <div className="auth-face">
          <div className="face-eyes">
            <div
              className="eye left"
              style={{
                transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 10}px, ${(mousePos.y / window.innerHeight - 0.5) * 10}px)`
              }}
            ></div>
            <div
              className="eye right"
              style={{
                transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * 10}px, ${(mousePos.y / window.innerHeight - 0.5) * 10}px)`
              }}
            ></div>
          </div>
          <div className="face-mouth"></div>
        </div>
        <h2 className="auth-title">Sign In</h2>
        <form onSubmit={handleSubmit} className="auth-form" role="form" aria-label="Sign in form">
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-label="Email address"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-label="Password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
            aria-label="Sign in to your account"
          >
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <button
          className="auth-create-account-btn"
          onClick={() => navigate('/signup')}
          aria-label="Create a new account"
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signin;