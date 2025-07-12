import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signup.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

// Format phone number (assumes Kenyan format, e.g., +254123456789)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  const match = phoneNumber.match(/^\+254(\d{3})(\d{3})(\d{3})$/) || phoneNumber.match(/^07(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254 ${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
};

// Parse phone number to raw format for submission
const parsePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\s/g, '');
  const match = cleaned.match(/^(\+254|07)(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254${match[2]}${match[3]}${match[4]}`;
  }
  return phoneNumber;
};

function Signup() {
  const [formData, setFormData] = useState({
    teacher_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const pupils = document.querySelectorAll('.signup__pupil');
      pupils.forEach((pupil) => {
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone_number' ? formatPhoneNumber(value) : value
    }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phone) => /^\+254\d{9}$/.test(parsePhoneNumber(phone));
  const validateTeacherId = (id) => /^[A-Za-z0-9]+$/.test(id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const requiredFields = ['teacher_id', 'first_name', 'last_name', 'email', 'phone_number', 'password', 'confirm_password'];
    if (requiredFields.some((field) => !formData[field])) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!validateTeacherId(formData.teacher_id)) {
      setError('Teacher ID must contain only letters and numbers');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.phone_number)) {
      setError('Please enter a valid phone number (e.g., +254123456789 or 0712345678)');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/register', {
        teacher_id: formData.teacher_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: parsePhoneNumber(formData.phone_number),
        password: formData.password
      });

      setSuccess('Registration successful! Redirecting to sign in...');
      setLoading(false);
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <h2 className="signup__title">Sign Up</h2>
      <div className={`signup__face-container ${success ? 'signup__face-container--smile' : ''}`}>
        <div className="signup__face">
          <div className="signup__eye"><div className="signup__pupil" /></div>
          <div className="signup__eye"><div className="signup__pupil" /></div>
          {success && <div className="signup__smile-mouth" />}
        </div>
      </div>
      {error && <p className="signup__error">{error}</p>}
      {success && <p className="signup__success">{success}</p>}
      <form onSubmit={handleSubmit} className="signup__form">
        {Object.entries({
          teacher_id: 'Teacher ID',
          first_name: 'First Name',
          last_name: 'Last Name',
          email: 'Email',
          phone_number: 'Phone Number',
          password: 'Password',
          confirm_password: 'Confirm Password'
        }).map(([name, label]) => (
          <div className="signup__form-group" key={name}>
            <label htmlFor={name} className="signup__label">{label}</label>
            <input
              type={name.includes('password') ? 'password' : name === 'email' ? 'email' : name === 'phone_number' ? 'tel' : 'text'}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={name === 'phone_number' ? '+254 123 456 789' : name === 'teacher_id' ? 'e.g., T1001' : ''}
              required
              disabled={loading}
              className={`signup__input ${name === 'phone_number' ? 'signup__input--phone' : ''}`}
              onFocus={() => setFocusedInput(name)}
              onBlur={() => setFocusedInput('')}
            />
          </div>
        ))}
        <button
          type="submit"
          className="signup__submit"
          disabled={loading}
        >
          {loading ? <span className="signup__spinner" /> : 'Sign Up'}
        </button>
      </form>
      <p className="signup__signin-link">
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </div>
  );
}

export default Signup;