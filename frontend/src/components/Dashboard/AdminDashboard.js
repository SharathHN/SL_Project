import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      <div className="dashboard-buttons">
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/admin-dashboard/manage-doctors')} // Updated URL for Manage Doctors section
        >
          Manage Doctors
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/patient-assignment')}
        >
          Patient Assignment
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/view-statistics')}
        >
          View Statistics
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
