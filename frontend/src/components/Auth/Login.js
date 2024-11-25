import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error

    try {
      // Send login request to the backend
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username, // Assuming the backend expects "email"
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);

        // Save the token in localStorage
        localStorage.setItem('access_token', data.access_token);

        // Navigate to the dashboard or home page
        navigate('/dashboard');
      } else {
        // Handle errors
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login to Medical Platform</h2>
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
          <p className="signup-note">
            Don't have an account? <a href="/signup">Sign up here</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
