import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalContext } from '../../../App';
import '../../../styles/login.css';

function PatientLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {globalState, setGlobalState} = useContext(globalContext);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');

    try {
      // Send a POST request to the backend
      const response = await fetch('http://127.0.0.1:5000/api/patient/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,  // assuming backend expects "email" field
          password: password,
        }),
      });

      // Check if login was successful
      if (response.ok) {
        const data = await response.json();
        
        // Check if JWT token is provided
        if (data.access_token) {
          // Save the access token in localStorage
            localStorage.setItem('patient_access_token', data.access_token);
            // Redirect to the patient's dashboard
            localStorage.setItem('globalState', JSON.stringify({...data}));
            setGlobalState((state)=>{
                return {
                    ...data
                }
            });

            
          navigate('/patient-dashboard');
        } else {
          setError('Login failed. No token received.');
        }
      } else {
        // Handle error response
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please try again.');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An error occurred. Please try again later.');
      setUsername('');
      setPassword('');
    }

    // Clear input fields after submission
    
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button className="home-button" onClick={() => navigate('/')}><span>&larr; </span></button>
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Patient Login</h2>
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
            Don’t have an account? <a href="/patient-signup">Sign up here</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default PatientLogin;
