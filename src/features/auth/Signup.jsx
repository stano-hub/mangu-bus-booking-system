// src/features/auth/Signup.jsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import bgImage from '../../assets/logo.jpeg';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'teacher', // default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const strength = useMemo(() => {
    const pwd = formData.password || '';
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return pwd.length ? 'weak' : '';
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await authService.signup(formData);
      login(res.user, res.token);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/${res.user.role}`);
      }, 800);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container signup"
      style={{ ['--auth-bg-image']: `url(${bgImage})` }}
    >
      <motion.div
        className="profile"
        data-success={success}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="auth-title">Signup</h1>

        {error && <p className="profile__error">{error}</p>}
        {success && <p className="profile__success">Account created successfully!</p>}

        <form onSubmit={handleSubmit} className="profile__form">
          <label>
            name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </label>

          <label>
            Teacher ID (3 digits, optional)
            <input
              type="text"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              maxLength="3"
              pattern="[0-9]{3}"
              placeholder="123"
            />
          </label>

          <label>
            email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                minLength="6"
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

          {strength && (
            <div className={`password-strength password-strength--${strength}`}>
              Password Strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
            </div>
          )}

          <label>
            phoneNumber
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+254712345678"
            />
          </label>

          <div className="auth-legal">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                aria-required="true"
              />
              <span>
                I agree to the <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
              </span>
            </label>
          </div>

          <div className="profile__buttons">
            <motion.button
              type="submit"
              className="profile__submit-btn"
              disabled={loading || !agree}
              whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(31, 97, 255, 0.25)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {loading ? (
                <span className="profile__loading">
                  <span className="profile__spinner"></span> Signing up...
                </span>
              ) : (
                'Sign Up'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;