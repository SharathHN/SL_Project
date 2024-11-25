from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Appointment, Doctor, Patient

appointment_blueprint = Blueprint('appointment_blueprint', __name__)

# Function to calculate priority score based on severity in notes
def calculate_priority_score(notes):
    severe_keywords = ["critical", "emergency", "urgent", "severe", "intense"]
    moderate_keywords = ["moderate", "important", "significant"]
    mild_keywords = ["mild", "routine", "normal"]

    score = 0
    notes_lower = notes.lower() if notes else ""

    if any(keyword in notes_lower for keyword in severe_keywords):
        score += 10
    elif any(keyword in notes_lower for keyword in moderate_keywords):
        score += 5
    elif any(keyword in notes_lower for keyword in mild_keywords):
        score += 2
    else:
        score += 1  # Default low priority

    return score

# Route: Request Appointment
@appointment_blueprint.route('/api/request-appointment', methods=['POST'])
@jwt_required()
def request_appointment():
    try:
        current_user = get_jwt_identity()
        if current_user['role'] != 'patient':
            return jsonify({'message': 'Unauthorized'}), 403

        # Get data from request
        data = request.json
        doctor_id = data.get('doctor_id')
        patient_id = current_user['id']  # Patient ID from JWT
        notes = data.get('notes', "")

        # Validate inputs
        if not doctor_id:
            return jsonify({'message': 'Missing required fields'}), 400

        # Calculate priority score
        priority_score = calculate_priority_score(notes)

        # Create a new appointment
        new_appointment = Appointment(
            doctor_id=doctor_id,
            patient_id=patient_id,
            notes=notes,
            priority_score=priority_score,
            status="requested"
        )
        db.session.add(new_appointment)
        db.session.commit()

        return jsonify({'message': 'Appointment requested successfully', 'priority_score': priority_score}), 201
    except Exception as e:
        return jsonify({'message': 'Error requesting appointment', 'error': str(e)}), 500

# Route: Get Appointments for a Particular Patient
@appointment_blueprint.route('/api/appointments/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_appointments_for_particular_patient(patient_id):
    try:
        current_user = get_jwt_identity()

        # Allow only patients themselves or admins to view the appointments
        if current_user['role'] not in ['patient', 'admin']:
            return jsonify({'message': 'Unauthorized'}), 403

        if current_user['role'] == 'patient' and current_user['id'] != patient_id:
            return jsonify({'message': 'Unauthorized'}), 403

        # Fetch appointments for the given patient ID
        appointments = Appointment.query.filter_by(patient_id=patient_id).all()
        if not appointments:
            return jsonify({'message': 'No appointments found for this patient'}), 404

        # Format the data
        appointment_list = [
            {
                'id': appt.id,
                'doctor_id': appt.doctor_id,
                'doctor_name': Doctor.query.get(appt.doctor_id).name if appt.doctor_id else None,
                'status': appt.status,
                'notes': appt.notes,
                'priority_score': appt.priority_score
            } for appt in appointments
        ]

        return jsonify({'appointments': appointment_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500

# Route: Get Appointments for a Particular Doctor
@appointment_blueprint.route('/api/appointments/doctor/<string:doctor_id>', methods=['GET'])
@jwt_required()
def get_appointments_for_particular_doctor(doctor_id):
    try:
        current_user = get_jwt_identity()
        print(current_user)

        # Allow only the doctor themselves or admins to view the appointments
        if current_user['role'] not in ['doctor', 'admin']:
            return jsonify({'message': 'Unauthorized'}), 403

        if current_user['role'] == 'doctor' and current_user['id'] != doctor_id:
            return jsonify({'message': 'Unauthorized'}), 403

        # Fetch appointments for the given doctor ID
        appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
        print(appointments)
        if not appointments:
            return jsonify({'message': 'No appointments found for this doctor'}), 404

        # Format the data
        appointment_list = [
            {
                'id': appt.id,
                'patient_id': appt.patient_id,
                'patient_name': Patient.query.get(appt.patient_id).name if appt.patient_id else None,
                'status': appt.status,
                'notes': appt.notes,
                'priority_score': appt.priority_score
            } for appt in appointments
        ]

        return jsonify({'appointments': appointment_list}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500

# Route: Get Specializations
@appointment_blueprint.route('/api/specializations', methods=['GET'])
@jwt_required()
def get_specializations():
    try:
        specializations = db.session.query(Doctor.specialization).distinct().all()
        specialization_list = [spec[0] for spec in specializations]
        return jsonify({'specializations': specialization_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching specializations', 'error': str(e)}), 500

# Route: Get Doctors by Specialization
@appointment_blueprint.route('/api/doctors', methods=['GET'])
@jwt_required()
def get_doctors_by_specialization():
    try:
        specialization = request.args.get('specialization')
        if not specialization:
            return jsonify({'message': 'Specialization is required'}), 400

        doctors = Doctor.query.filter_by(specialization=specialization).all()
        doctor_list = [{'id': doc.id, 'name': doc.name} for doc in doctors]

        return jsonify({'doctors': doctor_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching doctors', 'error': str(e)}), 500
