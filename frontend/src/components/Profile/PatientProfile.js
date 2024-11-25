import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Profile.css';

function PatientProfile({ isOwnProfile }) {
  const navigate = useNavigate();

  // Mocked patient data
  const patientData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    medical_id: '123456789',
    photo: '', // Set this to a photo URL if available, or leave as an empty string for the placeholder
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <div className="patient-profile-container">
      <h2 className="patient-profile-title">Patient Profile</h2>
      <div className="patient-profile-content">
        <div className="patient-profile-image-container">
          {patientData.photo ? (
            <img src={patientData.photo} alt="Patient Profile" className="patient-profile-image" />
          ) : (
            <div className="patient-profile-no-image">No Photo</div>
          )}
        </div>
        <div className="patient-profile-info">
          <div className="patient-profile-row">
            <label>Name:</label>
            <p>{patientData.name}</p>
          </div>
          <div className="patient-profile-row">
            <label>Contact:</label>
            <p>{patientData.email}</p>
          </div>
          <div className="patient-profile-row">
            <label>Medical ID:</label>
            <p>{patientData.medical_id}</p>
          </div>
          {isOwnProfile && (
            <button className="patient-edit-button" onClick={handleEditProfile}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
