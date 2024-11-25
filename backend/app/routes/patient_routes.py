from flask import Blueprint, request, jsonify, current_app,send_file
from werkzeug.utils import secure_filename
from app.models import  db,Doctor,Appointment,Patient
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from elasticapm import capture_span
import os
from .. import bcrypt
from cryptography.fernet import Fernet
from datetime import datetime
import io
import uuid
import logging
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode



# Initialize tracer and logger
tracer = trace.get_tracer(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("PatientAPI")
patient_blueprint = Blueprint('patient_blueprint', __name__)


@patient_blueprint.route('/api/patient/login', methods=['POST'])
def login_patient():
    with tracer.start_as_current_span("login_patient_handler") as span:
        try:
            # Extract request data
            with tracer.start_as_current_span("extract_request_data"):
                data = request.json
                email = data.get('email')
                password = data.get('password')

                span.set_attributes({
                    "input.email": email,
                    "input.password_provided": bool(password)
                })

            # Query the database for the patient
            with tracer.start_as_current_span("fetch_patient_from_db"):
                patient = Patient.query.filter_by(email=email).first()
                span.set_attribute("patient_found", bool(patient))

            # Validate the password
            with tracer.start_as_current_span("validate_password"):
                if patient and bcrypt.check_password_hash(patient.password, password):
                    with tracer.start_as_current_span("generate_access_token"):
                        access_token = create_access_token(identity={'id': patient.id, 'role': 'patient'})
                        span.set_status(Status(StatusCode.OK))
                        span.set_attribute("login_successful", True)
                        logger.info("Patient login successful for email: %s", email)
                        return jsonify({'access_token': access_token}), 200

                span.add_event("Invalid credentials provided")
                span.set_status(Status(StatusCode.ERROR, "Invalid credentials"))
                logger.warning("Invalid login attempt for email: %s", email)
                return jsonify({'message': 'Invalid credentials'}), 401

        except Exception as e:
            # Log and record exception in tracing
            logger.error("Error during patient login: %s", str(e), exc_info=True)
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Error during login"))
            return jsonify({'message': 'Error during login', 'error': str(e)}), 500

@patient_blueprint.route('/api/patient/view-doctor/<int:doctor_id>', methods=['GET'])
@jwt_required()
@capture_span()
def view_doctor_profile(doctor_id):
    try:
        doctor = Doctor.query.get(doctor_id)
        if not doctor:
            return jsonify({'message': 'Doctor not found'}), 404

        doctor_info = {
            'doctor_id': doctor.id,
            'name': doctor.name,
            'email': doctor.email,
            'specialization': doctor.specialization,
            'date_of_birth': doctor.date_of_birth,
            'photos': doctor.photos
        }

        return jsonify(doctor_info), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching doctor profile', 'error': str(e)}), 500

@patient_blueprint.route('/api/patient/edit-profile', methods=['PUT'])
@jwt_required()
@capture_span()
def edit_patient_profile():
    try:
        user_id = get_jwt_identity()['id']
        data = request.json
        patient = Patient.query.get(user_id)

        # Update profile fields if provided
        patient.name = data.get('name', patient.name)
        patient.date_of_birth = data.get('date_of_birth', patient.date_of_birth)
        patient.height = data.get('height', patient.height)
        patient.weight = data.get('weight', patient.weight)
        patient.blood_group = data.get('blood_group', patient.blood_group)
        patient.blood_pressure = data.get('blood_pressure', patient.blood_pressure)

        # Update profile photo if provided
        if 'file' in request.files:
            file = request.files['file']
            if file and allowed_photo(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                patient.photos = filename

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500
    

@patient_blueprint.route('/api/patient/book-appointment', methods=['POST'])
@jwt_required()
@capture_span()
def book_appointment():
    try:
        user_id = get_jwt_identity()['id']
        data = request.json
        doctor_id = data.get('doctor_id')
        appointment_date = data.get('appointment_date')
        notes=data.get('notes')

        # Convert the appointment date from string to datetime
        appointment_date = datetime.strptime(appointment_date, '%Y-%m-%d %H:%M:%S')

        new_appointment = Appointment(
            doctor_id=doctor_id,
            patient_id=user_id,
            appointment_date=appointment_date,
            status="scheduled",
            notes=notes
        )
        db.session.add(new_appointment)
        db.session.commit()

        return jsonify({'message': 'Appointment booked successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error booking appointment', 'error': str(e)}), 500
    
@patient_blueprint.route('/api/patient/download-report/<int:appointment_id>', methods=['GET'])
@jwt_required()
def download_report(appointment_id):
    try:
        user_id = get_jwt_identity()['id']
        appointment = Appointment.query.get(appointment_id)

        if not appointment or appointment.patient_id != user_id:
            return jsonify({'message': 'Unauthorized access'}), 403

        if not appointment.reports:
            return jsonify({'message': 'No report found for this appointment'}), 404

        # Get the report file path
        report_filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], appointment.reports)

        # Get password from request args
        password = request.args.get('password')
        if not password:
            return jsonify({'message': 'Password required to download report'}), 400

        # Decrypt the report
        decrypted_data = decrypt_file(report_filepath, password)
        return send_file(
            io.BytesIO(decrypted_data),
            as_attachment=True,
            download_name=appointment.reports
        )
    except Exception as e:
        return jsonify({'message': 'Error downloading report', 'error': str(e)}), 500



# patient_blueprint = Blueprint('patient', __name__)

@patient_blueprint.route('/api/patient/register', methods=['POST'])
@capture_span()
def register_patient():
    print("_________working1_________________")
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        date_of_birth = data.get('date_of_birth')
        height = data.get('height')
        weight = data.get('weight')
        blood_group = data.get('blood_group')
        blood_pressure = data.get('blood_pressure')

        if date_of_birth:
            date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()

        # Check if the patient already exists
        if Patient.query.filter_by(email=email).first():
            return jsonify({'message': 'Patient already exists'}), 409
        print("_________working2_________________")

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        # new_uuid = uuid.uuid4()
        # print(new_uuid)

        # Create a new Patient record
        new_patient = Patient(
            id = str(uuid.uuid4()),
            name=name,
            email=email,
            password=hashed_password,
            date_of_birth=date_of_birth,
            height=height,
            weight=weight,
            blood_group=blood_group,
            blood_pressure=blood_pressure
        )
        print("__________________________", "__________________________")
        db.session.add(new_patient)
        print("_______________________bla bla___", "__________________________")
        db.session.commit()
        print("__________________________", new_patient.id, "__________________________")
        # Optionally, you can provide a JWT token after registration
        access_token = create_access_token(identity={'id': new_patient.id, 'role': 'patient'})
        print("__________________________", access_token, "__________________________")
        return jsonify({
            'message': 'Patient registered successfully',
            'access_token': access_token
        }), 201
    except Exception as e:
        return jsonify({'message': 'Error during registration', 'error': str(e)}), 500
    
tracer = trace.get_tracer(__name__)
patient_blueprint = Blueprint('patient_blueprint', __name__)

@patient_blueprint.route('/api/patient/<string:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_by_id(patient_id):
    with tracer.start_as_current_span("get_patient_by_id") as span:
        span.set_attribute("input.patient_id", patient_id)
        try:
            patient = Patient.query.get(patient_id)
            span.set_attribute("patient_found", bool(patient))
            if not patient:
                span.add_event("Patient not found")
                span.set_status(Status(StatusCode.ERROR, "Patient not found"))
                return jsonify({'message': 'Patient not found'}), 404
            patient_data = {
                'id': patient.id,
                'name': patient.name,
                'email': patient.email,
                'date_of_birth': patient.date_of_birth.strftime('%Y-%m-%d') if patient.date_of_birth else None,
                'height': patient.height,
                'weight': patient.weight,
                'blood_group': patient.blood_group,
                'blood_pressure': patient.blood_pressure,
                'medical_history': patient.medical_history,
                'photos': patient.photos,
                'created_at': patient.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            span.set_status(Status(StatusCode.OK))
            return jsonify(patient_data), 200
        except Exception as e:
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Error fetching patient details"))
            return jsonify({'message': 'Error fetching patient details', 'error': str(e)}), 500


@patient_blueprint.route('/api/specializations', methods=['GET'])
def get_specializations():
    try:
        specializations = db.session.query(Doctor.specialization).distinct().all()
        specializations_list = [spec[0] for spec in specializations if spec[0] is not None]
        return jsonify({'specializations': specializations_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching specializations', 'error': str(e)}), 500

# API to get doctors by specialization
@patient_blueprint.route('/api/doctors', methods=['GET'])
def get_doctors_by_specialization():
    try:
        specialization = request.args.get('specialization')
        if not specialization:
            return jsonify({'message': 'Specialization is required'}), 400
        
        doctors = Doctor.query.filter_by(specialization=specialization).all()
        doctors_list = [
            {
                'id': doctor.id,
                'name': doctor.name,
                'email': doctor.email,
                'specialization': doctor.specialization,
            }
            for doctor in doctors
        ]
        return jsonify({'doctors': doctors_list}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching doctors', 'error': str(e)}), 500
def encrypt_file(filepath, password):
    cipher_suite = Fernet(password.encode())
    with open(filepath, 'rb') as file:
        file_data = file.read()
    encrypted_data = cipher_suite.encrypt(file_data)
    with open(filepath, 'wb') as file:
        file.write(encrypted_data)

def decrypt_file(filepath, password):
    cipher_suite = Fernet(password.encode())
    with open(filepath, 'rb') as file:
        encrypted_data = file.read()
    decrypted_data = cipher_suite.decrypt(encrypted_data)
    return decrypted_data

def allowed_photo(filename):
    allowed_extensions = {'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def allowed_file(filename):
    allowed_extensions = {'pdf', 'jpg', 'jpeg', 'png'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


