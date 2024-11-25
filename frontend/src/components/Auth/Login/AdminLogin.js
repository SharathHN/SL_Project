import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/login.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state

    try {
      // Send a POST request to the backend for login
      const response = await fetch('http://127.0.0.1:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username, // Assuming backend expects "email" field for admin username
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Check if JWT token is provided in the response
        if (data.access_token) {
          // Save the access token in localStorage
          localStorage.setItem('admin_access_token', data.access_token);
          console.log(data.access_token)

          // Redirect to the admin dashboard
          navigate('/admin-dashboard');
        } else {
          setError('Login failed. No token received.');
        }
      } else {
        // Handle error response
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred. Please try again later.');
    }

    // Clear input fields after submission
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button className="home-button" onClick={() => navigate('/')}><span>&larr; </span></button>
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
