import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import {jwtDecode} from 'jwt-decode'; // Ensure you have installed jwt-decode with `npm install jwt-decode`

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  // Function to decode the JWT and get doctor ID
  const getDoctorIdFromJWT = () => {
    try {
      const token = localStorage.getItem('doctor_access_token'); // Replace with your token key
      if (!token) {
        setMessage('You are not authenticated. Please log in.');
        return null;
      }
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded);
      return decoded.sub.id; // Adjust based on your JWT payload structure
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setMessage('Invalid authentication token.');
      return null;
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('doctor_access_token'); 
        const id = getDoctorIdFromJWT(); 

        if (!id || !token) {
          console.error('Missing doctor ID or token');
          return;
        }
        const response = await fetch(`http://127.0.0.1:5000/api/appointments/doctor/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
          },
        });

        if (response.ok) {
          const data = await response.json();
          const updatedAppointments = await Promise.all(
            data.appointments.map(async (appointment) => {
              const patientResponse = await fetch(
                
                `http://127.0.0.1:5000/api/doctor/patients/${appointment.patient_id}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                console.log(patientData.patient)
                return { ...appointment, name: patientData.patient.name }; // Add patient name to appointment
              } else {
                console.error('Failed to fetch patient details for ID:', appointment.patientId);
                return { ...appointment, name: 'Unknown' }; // Fallback if patient API fails
              }
            })
          );

          setAppointments(updatedAppointments);
        } else {
          console.error('Failed to fetch appointments.');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const handlePatientForm = (patientId) => {
    // Navigate to the patient's form page using their ID
    navigate(`/patient-form/${patientId}`);
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Doctor Dashboard - Appointments</h2>
      {appointments.length > 0 ? (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={appointment.id}>
                <td>{index + 1}</td>
                <td>{appointment.name}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => handlePatientForm(appointment.patientId)}
                  >
                    View Form
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-appointments">No appointments available.</div>
      )}
    </div>
  );
}

export default DoctorDashboard;
