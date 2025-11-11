// src/pages/AuthPage.jsx
import React, { useState } from "react";
import Signin from "../features/auth/Signin";
import Signup from "../features/auth/Signup";
import "../features/auth/auth.css";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleMode = () => {
    setIsSignup((prev) => !prev);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-form">
            {isSignup ? <Signup /> : <Signin />}
          </div>
          <div className="auth-switch-row" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <span>{isSignup ? "Already have an account?" : "Don’t have an account?"} </span>
            <button onClick={() => setIsSignup((p) => !p)} className="auth-switch-btn-link">
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
