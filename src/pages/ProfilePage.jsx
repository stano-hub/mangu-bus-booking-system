// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
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
      // Profile update will be reflected via AuthContext
      setSuccess("Profile updated successfully!");
      // Refresh user data
      window.location.reload(); // Simple way to refresh user context
    } catch (err) {
      setError(err.error || err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="profile-error">You must be logged in to view your profile.</p>;

  return (
    <div className="profile-container">
      <div className="profile">
        <h2 className="profile__title">My Profile</h2>

        {error && <p className="profile__error">{error}</p>}
        {success && <p className="profile__success">{success}</p>}

        <form onSubmit={handleUpdate} className="profile__form">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
            />
          </label>

          <button 
            type="submit" 
            disabled={loading}
            className="profile__submit-btn"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
