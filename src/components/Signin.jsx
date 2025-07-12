import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signin.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

// Format phone number (assumes Kenyan format, e.g., +254712345678)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  const match = phoneNumber.match(/^\+254(\d{3})(\d{3})(\d{3})$/) || phoneNumber.match(/^07(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
};

function Signin({ setUser }) {
  const [formData, setFormData] = useState({ teacher_id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const eyes = document.querySelectorAll('.signin__pupil');
      eyes.forEach((pupil) => {
        const rect = pupil.getBoundingClientRect();
        const x = e.clientX - rect.left - 5;
        const y = e.clientY - rect.top - 5;
        pupil.style.transform = `translate(${x / 15}px, ${y / 15}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.teacher_id || !formData.password) {
      setError('Teacher ID and password are required');
      setLoading(false);
      return;
    }

    if (!/^[A-Za-z0-9]+$/.test(formData.teacher_id)) {
      setError('Teacher ID must contain only letters and numbers');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/login', formData);
      const { teacher } = response.data;
      setUser({
        ...teacher,
        phone_number: formatPhoneNumber(teacher.phone_number)
      });
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
      if (err.response?.status === 401) {
        setError('Invalid Teacher ID or password');
      }
    }
  };

  return (
    <div className="signin">
      <h2 className="signin__title">Sign In</h2>
      <div className="signin__eye-container">
        <div className="signin__face">
          <div className="signin__eye">
            <div className="signin__pupil" />
          </div>
          <div className="signin__eye">
            <div className="signin__pupil" />
          </div>
        </div>
      </div>
      {error && <p className="signin__error">{error}</p>}
      <form onSubmit={handleSubmit} className="signin__form">
        <div className="signin__form-group">
          <label htmlFor="teacher_id" className="signin__label">
            Teacher ID
          </label>
          <input
            type="text"
            id="teacher_id"
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            className="signin__input"
            required
            disabled={loading}
            placeholder="e.g., T1001"
          />
        </div>
        <div className="signin__form-group">
          <label htmlFor="password" className="signin__label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="signin__input"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="signin__submit"
          disabled={loading || !formData.teacher_id || !formData.password}
        >
          {loading ? <span className="signin__spinner" /> : 'Sign In'}
        </button>
      </form>
      <p className="signin__link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Signin;