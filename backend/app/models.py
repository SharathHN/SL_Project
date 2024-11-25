from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from app import db

class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)  # Unique license number for doctors
    specialization = db.Column(db.String(100), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)  # Optional for doctors
    photos = db.Column(db.String(255), nullable=True)  # File path or URL for doctor's profile photo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    nummber_of_appointments=db.Column(db.Integer,nullable=False,default=5)

    def __repr__(self):
        return f"<Doctor {self.name}>"

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    height = db.Column(db.Float, nullable=True)  # Patient's height in cm or inches
    weight = db.Column(db.Float, nullable=True)  # Patient's weight in kg or lbs
    blood_group = db.Column(db.String(3), nullable=True)  # Blood group (e.g., A+, B-, etc.)
    blood_pressure = db.Column(db.String(7), nullable=True)  # Blood pressure (e.g., 120/80)
    medical_history = db.Column(db.Text, nullable=True)
    photos = db.Column(db.String(255), nullable=True)  # File path or URL for patient's profile photo
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Patient {self.name}>"


class Administrator(db.Model):
    __tablename__ = 'administrators'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    admin_level = db.Column(db.String(50), nullable=True)  # Admin level or designation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Administrator {self.name}>"
    
class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=True)  # Date and time of the appointment
    status = db.Column(db.String(50), default="requested")  # Status: scheduled, completed, canceled, etc.
    notes = db.Column(db.Text, nullable=True)  # Additional notes for the appointment
    scans = db.Column(db.String(200), nullable=True)  # Path or filename for scans related to the appointment
    reports = db.Column(db.String(200), nullable=True)  # Path or filename for reports related to the appointment
    priority_score=db.Column(db.Integer,nullable=True)
    queue_duration=db.Column(db.Integer,nullable=True)


    # Relationships
    doctor = db.relationship('Doctor', backref=db.backref('appointments', lazy=True))
    patient = db.relationship('Patient', backref=db.backref('appointments', lazy=True))

    def __repr__(self):
        return f"<Appointment {self.id} - Doctor {self.doctor_id} - Patient {self.patient_id}>"
