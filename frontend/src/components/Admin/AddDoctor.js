import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

function AddDoctor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    license: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


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
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('admin_access_token');
      console.log(token)
    if (!token) {
      setError('You are not authorized. Please log in again.');
      return;
    }

    const response = await fetch('http://127.0.0.1:5000/api/admin/add-doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the JWT token in the Authorization header
      },
      body: JSON.stringify(formData),
    });

      if (response.ok) {
        setSuccessMessage('Doctor added successfully!');
        // Redirect to manage doctors page after a delay
        setTimeout(() => {
          navigate('/admin-dashboard/manage-doctors');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add doctor.');
      }
    } catch (err) {
      console.error('Error adding doctor:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="add-doctor-container">
      <h2 className="add-doctor-title">Add Doctor</h2>
      <form className="add-doctor-form" onSubmit={handleSubmit}>
        {error && <p className="add-error-message">{error}</p>}
        {successMessage && <p className="add-success-message">{successMessage}</p>}
        
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="add-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="add-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="add-input"
        />
        <input
          type="text"
          name="specialization"
          placeholder="Specialization"
          value={formData.specialization}
          onChange={handleChange}
          required
          className="add-input"
        />
        <input
          type="text"
          name="license"
          placeholder="License number"
          value={formData.license}
          onChange={handleChange}
          required
          className="add-input"
        />
        
        <button type="submit" className="add-submit-button">Add Doctor</button>
      </form>
    </div>
  );
}

export default AddDoctor;
