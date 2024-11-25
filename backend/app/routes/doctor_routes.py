from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.models import  db,Doctor,Appointment,Patient
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from elasticapm import capture_span
import os
from .. import bcrypt

doctor_blueprint = Blueprint('doctor', __name__)

@doctor_blueprint.route('/api/doctor/login', methods=['POST'])
@capture_span()
def login_doctor():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        doctor = Doctor.query.filter_by(email=email).first()
        if doctor and bcrypt.check_password_hash(doctor.password, password):
            access_token = create_access_token(identity={'id': doctor.id, 'role': 'doctor'})
            return jsonify({'access_token': access_token}), 200

        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': 'Error during login', 'error': str(e)}), 500

@doctor_blueprint.route('/api/doctor/appointments', methods=['GET'])
@jwt_required()
@capture_span()
def view_appointments():
    try:
        user_id = get_jwt_identity()['id']
        user_role = get_jwt_identity()['role']

        if user_role != 'doctor':
            return jsonify({'message': 'Unauthorized'}), 403

        # Retrieve appointments for the logged-in doctor
        appointments = Appointment.query.filter_by(doctor_id=user_id).all()
        appointments_list = [
            {
                'appointment_id': appointment.id,
                'patient_id': appointment.patient_id,
                'appointment_date': appointment.appointment_date,
                'status': appointment.status,
                'notes': appointment.notes,
                'scans': appointment.scans,
                'reports': appointment.reports
            }
            for appointment in appointments
        ]

        return jsonify({'appointments': appointments_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500


@doctor_blueprint.route('/api/doctor/patients/<string:patient_id>', methods=['GET'])
@jwt_required()
@capture_span()
def view_patient(patient_id):
    try:
        user_id = get_jwt_identity()['id']
        user_role = get_jwt_identity()['role']

        if user_role != 'doctor':
            return jsonify({'message': 'Unauthorized'}), 403

        # Query the patient associated with this doctor's appointments
        patient = Patient.query.join(Appointment, Appointment.patient_id == Patient.id).filter(
            Appointment.doctor_id == user_id,
            Patient.id == patient_id
        ).first()

        if not patient:
            return jsonify({'message': 'Patient not found or not associated with this doctor'}), 404

        patient_details = {
            'patient_id': patient.id,
            'name': patient.name,
            'email': patient.email,
            'date_of_birth': patient.date_of_birth,
            'height': patient.height,
            'weight': patient.weight,
            'blood_group': patient.blood_group,
            'blood_pressure': patient.blood_pressure,
            'medical_history': patient.medical_history,
            'photos': patient.photos
        }

        return jsonify({'patient': patient_details}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching patient', 'error': str(e)}), 500



@doctor_blueprint.route('/api/doctor/edit-profile', methods=['PUT'])
@jwt_required()
@capture_span()
def edit_doctor_profile():
    try:
        user_id = get_jwt_identity()['id']
        user_role = get_jwt_identity()['role']

        if user_role != 'doctor':
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.json
        doctor = Doctor.query.get(user_id)

        # Update fields if provided
        doctor.name = data.get('name', doctor.name)
        doctor.specialization = data.get('specialization', doctor.specialization)
        doctor.date_of_birth = data.get('date_of_birth', doctor.date_of_birth)

        # Check if there's a photo file in the request to update
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_photo(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                doctor.photos = filename  # Update the doctor's photo

        db.session.commit()

        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500
@doctor_blueprint.route('/api/appointments/<int:appointment_id>/edit', methods=['PUT'])
@jwt_required()
@capture_span()
def edit_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()['id']
        user_role = get_jwt_identity()['role']

        if user_role != 'doctor':
            return jsonify({'message': 'Unauthorized'}), 403

        # Find the appointment
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != user_id:
            return jsonify({'message': 'Appointment not found or unauthorized access'}), 404

        # Update appointment details from JSON data if provided
        data = request.json
        appointment.notes = data.get('notes', appointment.notes)
        appointment.status = data.get('status', appointment.status)

        # Check if there are files in the request for reports or scans
        if 'report' in request.files:
            report_file = request.files['report']
            if report_file and allowed_file(report_file.filename):
                report_filename = secure_filename(report_file.filename)
                report_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], report_filename)
                report_file.save(report_filepath)
                appointment.reports = report_filename  # Save report filename in the database

        if 'scan' in request.files:
            scan_file = request.files['scan']
            if scan_file and allowed_file(scan_file.filename):
                scan_filename = secure_filename(scan_file.filename)
                scan_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], scan_filename)
                scan_file.save(scan_filepath)
                appointment.scans = scan_filename  # Save scan filename in the database

        db.session.commit()

        return jsonify({'message': 'Appointment updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error updating appointment', 'error': str(e)}), 500


def allowed_photo(filename):
    allowed_extensions = {'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def allowed_file(filename):
    allowed_extensions = {'pdf', 'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

