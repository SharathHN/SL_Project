import React from 'react';
import '../../styles/admin.css';
import { useNavigate } from 'react-router-dom';

function ManageDoctors() {
  const navigate = useNavigate();

  const handleAddDoctor = () => {
    // Navigate to add doctor form or display a modal
    navigate('/admin-dashboard/manage-doctors/add-doctor');
  };

  const handleViewAllDoctors = () => {
    // Navigate to the list of doctors or fetch and display all doctors
    console.log("View All Doctors button clicked");
  };

  return (
    <div className="manage-doctors-container">
      <h2 className="manage-doctors-title">Manage Doctors</h2>
      <div className="manage-doctors-options">
        <button className="manage-doctors-button" onClick={handleAddDoctor}>
          Add Doctor
        </button>
        <button className="manage-doctors-button" onClick={handleViewAllDoctors}>
          View All Doctors
        </button>
      </div>
    </div>
  );
}

export default ManageDoctors;
