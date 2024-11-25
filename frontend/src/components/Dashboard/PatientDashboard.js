import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assumes React Router is used for navigation
import '../../styles/Dashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Patient Dashboard</h2>
      <div className="dashboard-buttons">
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/view-reports')} // URL for View Reports section
        >
          View Reports
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/schedule-appointment')} // URL for Request Appointment section
        >
          Request Appointment
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/about-me')} // URL for About Me/Profile Settings section
        >
          About Me
        </button>
      </div>
    </div>
  );
}

export default PatientDashboard;
