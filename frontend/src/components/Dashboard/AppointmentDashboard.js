import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

function Appointments({ role }) {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    appointment_date: '',
    notes: '',
    status: 'requested',
    priority_score: '',
    queue_duration: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const endpoint =
          role === 'doctor'
            ? 'http://127.0.0.1:5000/api/doctor/appointments'
            : 'http://127.0.0.1:5000/api/patient/appointments';
        const response = await fetch(endpoint);

        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
        } else {
          console.error('Failed to fetch appointments.');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };

    fetchAppointments();
  }, [role]);

  const handleEdit = async (appointmentId) => {
    if (role !== 'doctor') return;

    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/doctor/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSuccess('Appointment updated successfully!');
        const updatedAppointments = await response.json();
        setAppointments(updatedAppointments.appointments || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update appointment.');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleFileUpload = async (appointmentId) => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/doctor/appointments/${appointmentId}/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      );

      if (response.ok) {
        setSuccess('File uploaded successfully!');
        const updatedAppointments = await response.json();
        setAppointments(updatedAppointments.appointments || []);
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload file.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('An error occurred during file upload.');
    }
  };

  const handleDownload = (filePath) => {
    const anchor = document.createElement('a');
    anchor.href = filePath;
    anchor.download = filePath.split('/').pop();
    anchor.click();
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">
        {role === 'doctor' ? 'Doctor' : 'Patient'} Appointments
      </h2>
      <div className="dashboard-buttons">
        {appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <div key={appointment.id} className="dashboard-button">
              <p><strong>Sl. No.:</strong> {index + 1}</p>
              <p><strong>Doctor ID:</strong> {appointment.doctor_id}</p>
              <p><strong>Patient ID:</strong> {appointment.patient_id}</p>
              <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleString()}</p>
              <p><strong>Status:</strong> {appointment.status}</p>
              <p><strong>Notes:</strong> {appointment.notes || 'No notes'}</p>
              {appointment.reports && (
                <p>
                  <strong>Reports:</strong>
                  <button
                    className="dashboard-button"
                    onClick={() => handleDownload(appointment.reports)}
                  >
                    Download Reports
                  </button>
                </p>
              )}

              {role === 'doctor' && (
                <>
                  <input
                    type="datetime-local"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, appointment_date: e.target.value })
                    }
                    placeholder="Change Date"
                    className="dashboard-button"
                  />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add Notes"
                    className="dashboard-button"
                  ></textarea>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="dashboard-button"
                  />
                  <button
                    className="dashboard-button"
                    onClick={() => handleFileUpload(appointment.id)}
                  >
                    Upload File
                  </button>
                  <button
                    className="dashboard-button"
                    onClick={() => handleEdit(appointment.id)}
                  >
                    Update Appointment
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="dashboard-button">No appointments available.</p>
        )}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
}

export default Appointments;
RoleBased