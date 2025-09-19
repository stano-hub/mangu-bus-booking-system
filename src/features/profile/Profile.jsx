import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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

  // Reset success animation and message after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        setIsSuccess(true);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!profile.name || !profile.email) {
      setError('Name and email are required');
      setSaving(false);
      return;
    }
    if (profile.phone && !/^\+?\d{7,15}$/.test(profile.phone)) {
      setError('Phone number must be 7-15 digits, optional + prefix');
      setSaving(false);
      return;
    }

    try {
      const updated = await authService.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined
      });
      setProfile({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone || ''
      });
      setSuccess('Profile updated successfully');
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="profile" data-success={isSuccess}>
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
        <h2 className="profile__title">My Profile</h2>
        {loading ? (
          <div className="profile__loading">
            <span className="profile__spinner"></span>
            <p>Loading profile...</p>
          </div>
        ) : error && !saving ? (
          <p className="profile__error">{error}</p>
        ) : (
          <>
            {success && <p className="profile__success">{success}</p>}
            {error && <p className="profile__error">{error}</p>}
            <form className="profile__form" onSubmit={handleSave} role="form" aria-label="Edit profile form">
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
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
                  value={profile.email}
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
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="e.g., +254712345678"
                  aria-label="Phone number"
                />
              </label>
              <div className="profile__buttons">
                <button
                  type="submit"
                  className="profile__submit-btn"
                  disabled={saving}
                  aria-label="Save profile changes"
                >
                  {saving ? <span className="profile__spinner">Saving...</span> : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="profile__back-btn"
                  onClick={() => navigate('/dashboard')}
                  aria-label="Back to dashboard"
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;