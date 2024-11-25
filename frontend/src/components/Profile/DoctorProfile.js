import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import '../../styles/Profile.css';

function DoctorProfile({ isOwnProfile }) {
  const navigate = useNavigate(); // Initialize navigate hook

  // State variables to hold doctor's data
  const [doctorData, setDoctorData] = useState({
    name: '',
    email: '',
    license_number: '',
    specialization: '',
    date_of_birth: '',
    photos: '',
  });

  // Fetch doctor's data from the backend when the component mounts
  useEffect(() => {
    // Replace this URL with your actual backend API endpoint
    fetch('/api/doctor/profile')
      .then(response => response.json())
      .then(data => {
        setDoctorData({
          name: data.name,
          email: data.email,
          license_number: data.license_number,
          specialization: data.specialization,
          date_of_birth: data.date_of_birth,
          photos: data.photos,
        });
      })
      .catch(error => console.error('Error fetching doctor data:', error));
  }, []);

  // Function to handle the Edit Profile button click
  const handleEditProfile = () => {
    navigate('/edit-profile'); // Replace '/edit-profile' with the actual edit profile URL
  };

  return (
    <div className="profile-container">
      {isOwnProfile ? (
          <h2 className="profile-title">My Profile</h2>
        ):(
          <h2 className="profile-title">Doctor Profile</h2>
        )}
      <div className="profile-info">
        <div className="profile-image-container">
          {doctorData.photos ? (
            <img
              src={doctorData.photos}
              alt="Doctor Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-no-image">No Photo</div>
          )}
        </div>
        <div className="profile-details">
          <label>Name:</label>
          <p>{doctorData.name}</p>

          <label>Email:</label>
          <p>{doctorData.email}</p>

          <label>License Number:</label>
          <p>{doctorData.license_number}</p>

          <label>Specialization:</label>
          <p>{doctorData.specialization}</p>

          <label>Date of Birth:</label>
          <p>{doctorData.date_of_birth}</p>
        </div>
        {isOwnProfile && (
          <button className="edit-button" onClick={handleEditProfile}>Edit Profile</button>
        )}
      </div>
    </div>
  );
}

export default DoctorProfile;
