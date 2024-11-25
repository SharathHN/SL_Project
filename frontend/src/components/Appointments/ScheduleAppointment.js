import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"
import '../../styles/RequestAppointment.css';

function RequestAppointment() {
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all specializations on component mount
  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/specializations');
      const data = await response.json();
      setSpecializations(data.specializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchDoctors = async (specialization) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/doctors?specialization=${specialization}`);
      const data = await response.json();
      setDoctors(data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSpecializationChange = (e) => {
    const specialization = e.target.value;
    setSelectedSpecialization(specialization);
    setDoctors([]); // Reset doctors when specialization changes
    fetchDoctors(specialization); // Fetch doctors for the selected specialization
  };

  const getPatientIdFromJWT = () => {
    try {
      const token = localStorage.getItem('patient_access_token'); // Replace with your token key
      if (!token) {
        setMessage('You are not authenticated. Please log in.');
        return null;
      }
      const decoded = jwtDecode(token);
      console.log(decoded.sub.id) // Decode the token using jwt-decode
      return decoded.sub.id; // Adjust based on your JWT payload structure
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setMessage('Invalid authentication token.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const patientId = getPatientIdFromJWT();
    if (!patientId) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/request-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('patient_access_token')}`, // Include the JWT for backend authentication
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor,
          patient_id: patientId,
          appointment_date: appointmentDate,
          notes: notes,
        }),
      });

      if (response.ok) {
        setMessage('Appointment requested successfully!');
        setSelectedSpecialization('');
        setDoctors([]);
        setSelectedDoctor('');
        setAppointmentDate('');
        setNotes('');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to request appointment.');
      }
    } catch (error) {
      console.error('Error requesting appointment:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="request-appointment">
      <h2 className="request-title">Request an Appointment</h2>
      <form className="request-form" onSubmit={handleSubmit}>
        {message && (
          <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
        <div>
          <label>Specialization:</label>
          <select
            value={selectedSpecialization}
            onChange={handleSpecializationChange}
            required
          >
            <option value="">Select a specialization</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Doctor:</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={!selectedSpecialization}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Appointment Date:</label>
          <input
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes"
          />
        </div>

        <button type="submit" disabled={!selectedDoctor || !appointmentDate}>
          Request Appointment
        </button>
      </form>
    </div>
  );
}

export default RequestAppointment;
