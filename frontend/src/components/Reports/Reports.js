import React from 'react';
import '../../styles/Reports.css';

function Reports() {




  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');

    try {
      // Send a POST request to the backend
      const response = await fetch('http://127.0.0.1:5000/api/patient/login', {
        method: 'GET',
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
          setGlobalState((state)=>{
              return {
                  ...state, username: "1"
              }
          })
          navigate('/patient-dashboard');
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
  
  const reports = [
    { id: 1, name: 'Blood Test Report', date: '2024-10-05', link: '#' },
    { id: 2, name: 'X-Ray', date: '2024-09-21', link: '#' },
    { id: 3, name: 'MRI Scan', date: '2024-08-15', link: '#' },
  ];

  return (
    <div className="reports-container">
      <h2>Your Reports</h2>
      <ul className="reports-list">
        {reports.map((report) => (
          <li key={report.id} className="report-item">
            <a href={report.link} target="_blank" rel="noopener noreferrer">
              {report.name} - {report.date}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reports;
