import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  // Reset success animation after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        navigate('/signin');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      setLoading(false);
      return;
    }

    // Optional phone validation (basic format check)
    if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) {
      setError('Phone number must be 7-15 digits, optional + prefix');
      setLoading(false);
      return;
    }

    try {
      await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="signup" data-success={isSuccess}>
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
        <h2 className="auth-title">Sign Up</h2>
        {error && <p className="auth-error">{error}</p>}
        {isSuccess && <p className="auth-success">Sign up successful! Redirecting...</p>}
        <form onSubmit={handleSubmit} className="auth-form" role="form" aria-label="Sign up form">
          <label htmlFor="name">
            Name
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              aria-label="Full name"
            />
          </label>
          <label htmlFor="email">
            Email
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              aria-label="Email address"
            />
          </label>
          <label htmlFor="phone">
            Phone (optional)
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +254712345678"
              aria-label="Phone number"
            />
          </label>
          <label htmlFor="password">
            Password
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              aria-label="Password"
            />
          </label>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            aria-label="Sign up"
          >
            {loading ? <span className="spinner">Signing up...</span> : 'Sign Up'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;