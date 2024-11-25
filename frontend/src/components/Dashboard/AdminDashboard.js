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
          Manage Doctorsid = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=True)  # Date and time of the appointment
    status = db.Column(db.String(50), default="requested")  # Status: scheduled, completed, canceled, etc.
    notes = db.Column(db.Text, nullable=True)  # Additional notes for the appointment
    scans = db.Column(db.String(200), nullable=True)  # Path or filename for scans related to the appointment
    reports = db.Column(db.String(200), nullable=True)  # Path or filename for reports related to the appointment
    priority_score=db.Column(db.Integer,nullable=True)
    queue_duration=db.Column(db.Integer,nullable=True)
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
