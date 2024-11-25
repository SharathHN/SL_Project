import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/signup.css';

function PatientSignUp() {
  const navigate = useNavigate();

  // State variables to hold form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // State variable for error handling
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Prepare data for the backend
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/patient/register', { // Replace with your backend signup endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Redirect to login or another page on success
        navigate('/patient-login');
      } else {
        // Handle error response
        const data = await response.json();
        setError(data.message || 'An error occurred during sign-up');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <button className="home-button" onClick={() => navigate('/')}><span>&larr; </span></button>
        <h2>Patient Sign Up</h2>
        <p>Create your account to manage your medical records and appointments.</p>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Sign Up</button>
        </form>
        <p className="signup-note">Already have an account? <a href="/patient-login">Login here</a>.</p>
      </div>
    </div>
  );
}

export default PatientSignUp;
