// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineSave } from "react-icons/hi";
import "./profile.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updated = await authService.updateProfile(profile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err.error || err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="profile-page">
      <div className="profile-card">
        <p className="profile-error">You must be logged in to view your profile.</p>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="profile-role">
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
        </div>

        {error && <div className="profile-alert profile-alert-error">{error}</div>}
        {success && <div className="profile-alert profile-alert-success">{success}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label className="form-label">
              <HiOutlineUser className="form-icon" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <HiOutlineMail className="form-icon" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <HiOutlinePhone className="form-icon" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              value={profile.department || "Not assigned"}
              className="form-input form-input-readonly"
              readOnly
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="profile-submit-btn"
          >
            <HiOutlineSave className="btn-icon" />
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
