import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

// Shared Axios instance
const axiosInstance = axios.create({
  baseURL: 'https://stano360.pythonanywhere.com',
  withCredentials: true
});

// Format phone number (assumes Kenyan format, e.g., +254712345678)
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
  // Remove spaces and ensure +254 prefix
  const cleaned = phoneNumber.replace(/\s/g, '');
  const match = cleaned.match(/^(\+254|07)(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+254${match[2]}${match[3]}${match[4]}`;
  }
  return phoneNumber;
};

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: formatPhoneNumber(user?.phone_number) || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone_number' ? formatPhoneNumber(value) : value
    }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+254\d{9}$/.test(parsePhoneNumber(phone));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { first_name, last_name, email, phone_number } = formData;

    if (!first_name || !last_name || !email || !phone_number) {
      return setError('All fields are required');
    }
    if (!validateEmail(email)) {
      return setError('Please enter a valid email');
    }
    if (!validatePhone(phone_number)) {
      return setError('Please enter a valid phone number (e.g., +254712345678 or 0712345678)');
    }

    try {
      const res = await axiosInstance.patch('/api/profile', {
        first_name,
        last_name,
        email,
        phone_number: parsePhoneNumber(phone_number)
      });
      setSuccess('Profile updated successfully!');
      setUser((prev) => ({ ...prev, ...formData, phone_number: parsePhoneNumber(phone_number) }));
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      if (err.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  if (!user) {
    return <p className="profile__error">No user data available. Please log in.</p>;
  }

  return (
    <div className="profile">
      <h2 className="profile__title">My Profile</h2>
      {error && <p className="profile__error">{error}</p>}
      {success && <p className="profile__success">{success}</p>}
      <form onSubmit={handleSubmit} className="profile__form">
        <div className="profile__form-group">
          <label htmlFor="first_name" className="profile__label">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="profile__input"
            required
          />
        </div>
        <div className="profile__form-group">
          <label htmlFor="last_name" className="profile__label">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="profile__input"
            required
          />
        </div>
        <div className="profile__form-group">
          <label htmlFor="email" className="profile__label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="profile__input"
            required
          />
        </div>
        <div className="profile__form-group">
          <label htmlFor="phone_number" className="profile__label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="profile__input profile__input--phone"
            required
            placeholder="+254 712 345 678"
          />
        </div>
        <button type="submit" className="profile__submit">
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;