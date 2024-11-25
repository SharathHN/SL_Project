// src/components/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landingpage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to the Medical Platform</h1>
        <p>                                </p>
      </div>
      <div className="role-cards">
        <div className="role-card patient">
          <h2>Patient</h2>
          <button onClick={() => navigate('/patient-login')} className="landing-button">Login</button>
          <button onClick={() => navigate('/patient-signup')} className="landing-button">Sign Up</button>
        </div>
        <div className="role-card doctor">
          <h2>Doctor</h2>
          <button onClick={() => navigate('/doctor-login')} className="landing-button">Login</button>
          <button onClick={() => navigate('/doctor-signup')} className="landing-button">Sign Up</button>
        </div>
        <div className="role-card admin">
          <h2>Admin</h2>
          <button onClick={() => navigate('/admin-login')} className="landing-button">Login</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

