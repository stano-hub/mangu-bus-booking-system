// src/features/auth/Signup.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed, HiPhone, HiIdentification, HiEye, HiEyeOff } from 'react-icons/hi';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    email: '',
    password: '',
    phoneNumber: '',
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
      const { role, ...signupData } = formData;
      const res = await authService.signup(signupData);
      login(res.user, res.token);
      setSuccess(true);
      toast.success('Account created successfully!');
      setTimeout(() => {
        navigate(`/${res.user.role}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err.error || err.message || 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-header">
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join the Mang'u High School Bus System</p>

      {error && <div className="profile__error">{error}</div>}
      {success && <div className="profile__success">Account created successfully!</div>}

      <form onSubmit={handleSubmit} className="profile__form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-wrapper">
            <HiUser className="input-icon" />
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="teacherId">Teacher Code</label>
          <div className="input-wrapper">
            <HiIdentification className="input-icon" />
            <input
              id="teacherId"
              type="text"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              maxLength="3"
              pattern="[0-9]{3}"
              placeholder="Code from your timetable"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <HiMail className="input-icon" />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <HiLockClosed className="input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength="6"
            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>
          {strength && (
            <div className="password-strength">
              <div className={`password-strength-bar ${strength}`} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <div className="input-wrapper">
            <HiPhone className="input-icon" />
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+254712345678"
            />
          </div>
        </div>

        <div className="auth-legal">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
            />
            <span>
              I agree to the <span className="link-primary" style={{cursor: 'pointer'}}>Terms</span> & <span className="link-primary" style={{cursor: 'pointer'}}>Privacy</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="profile__submit-btn"
          disabled={loading || !agree}
        >
          {loading ? (
            <div className="profile__loading">
              <div className="profile__spinner" /> Creating account...
            </div>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>
    </div>
  );
};

export default Signup;