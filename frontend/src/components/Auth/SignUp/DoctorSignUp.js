// src/components/DoctorSignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/signup.css';

function DoctorSignUp() {
  const navigate = useNavigate();

  return (
    <div className="signup-page">
      <div className="signup-container">
        <button className="home-button" onClick={() => navigate('/')}><span>&larr; </span></button>
        <h2>Doctor Sign Up</h2>
        <p>Join our platform to connect with patients and manage appointments.</p>
        <form className="signup-form">
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="License Number" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <button type="submit">Sign Up</button>
        </form>
        <p className="signup-note">Already have an account? <a href="/doctor-login">Login here</a>.</p>
      </div>
    </div>
  );
}

export default DoctorSignUp;
