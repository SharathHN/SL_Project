import React, { useEffect, useState } from 'react';
import '../../styles/DoctorList.css'; // Ensure you create and customize this CSS file for styling.

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch all doctors and their specializations
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('admin_access_token'); // Replace with the appropriate token key
        if (!token) {
          setMessage('You are not authenticated. Please log in.');
          return;
        }

        const response = await fetch('http://127.0.0.1:5000/api/doctors', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Add the JWT token for admin authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDoctors(data.doctors);
        } else {
          const errorData = await response.json();
          setMessage(errorData.message || 'Failed to fetch doctors.');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setMessage('An error occurred. Please try again later.');
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="doctors-list">
      <h2 className="list-title">List of Doctors and Their Specializations</h2>
      {message && <p className="message">{message}</p>}
      {doctors.length > 0 ? (
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor, index) => (
              <tr key={doctor.id}>
                <td>{index + 1}</td>
                <td>{doctor.name}</td>
                <td>{doctor.specialization || 'Not Specified'}</td>
                <td>{doctor.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-doctors">No doctors available.</div>
      )}
    </div>
  );
}

export default DoctorList;