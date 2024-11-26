import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleAssignAppointments = async () => {
    try {
      const token = localStorage.getItem('admin_access_token'); 
      if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/api/admin/assign-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success: ${data.message}, Assigned Count: ${data.assigned_count}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to assign appointments.'}`);
      }
    } catch (error) {
      console.error('Error assigning appointments:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      <div className="dashboard-buttons">
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/admin-dashboard/manage-doctors')}
        >
          Manage Doctors
        </button>

        <button 
          className="dashboard-button" 
          onClick={handleAssignAppointments}
        >
          Patient Assignment
        </button>

        <button 
          className="dashboard-button" 
          onClick={() => navigate('/admin-dashboard/view-statistics')}
        >
          View Statistics
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;