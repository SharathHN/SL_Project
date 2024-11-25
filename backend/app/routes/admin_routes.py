from flask import Blueprint, request, jsonify
from app.models import Doctor, db, Administrator
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from .. import bcrypt
from datetime import timedelta, datetime
import uuid
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode
import logging

# Initialize tracer and logger
tracer = trace.get_tracer(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AdminAPI")

admin_blueprint = Blueprint('admin', __name__)

@admin_blueprint.route('/api/admin/add-doctor', methods=['POST'])
@jwt_required()
def add_doctor():
    with tracer.start_as_current_span("add-doctor-handler") as span:
        try:
            with tracer.start_as_current_span("verify-admin-role"):
                user_role = get_jwt_identity().get('role')
                span.set_attribute("user_role", user_role)
                if user_role != 'admin':
                    logger.warning("Unauthorized access attempt by user role: %s", user_role)
                    return jsonify({'message': 'Unauthorized'}), 403

            with tracer.start_as_current_span("extract-request-data"):
                data = request.json
                name = data.get('name')
                email = data.get('email')
                password = data.get('password')
                license_number = data.get('license')
                specialization = data.get('specialization')
                date_of_birth = data.get('date_of_birth')

                span.set_attributes({
                    "doctor_name": name,
                    "doctor_email": email,
                    "license_number": license_number,
                    "specialization": specialization
                })

                if date_of_birth:
                    date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()

            with tracer.start_as_current_span("check-duplicate-doctor"):
                if Doctor.query.filter((Doctor.email == email) | (Doctor.license_number == license_number)).first():
                    logger.info("Duplicate doctor detected with email: %s or license: %s", email, license_number)
                    return jsonify({'message': 'Doctor already exists with this email or license number'}), 409

            with tracer.start_as_current_span("hash-password"):
                hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

            with tracer.start_as_current_span("create-doctor-record"):
                new_doctor = Doctor(
                    id=str(uuid.uuid4()),
                    name=name,
                    email=email,
                    password=hashed_password,
                    license_number=license_number,
                    specialization=specialization,
                    date_of_birth=date_of_birth
                )

            with tracer.start_as_current_span("save-to-database"):
                db.session.add(new_doctor)
                db.session.commit()

            logger.info("Doctor added successfully: %s", name)
            return jsonify({'message': 'Doctor added successfully'}), 201
        except Exception as e:
            logger.error("Error adding doctor: %s", str(e), exc_info=True)
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Failed to add doctor"))
            return jsonify({'message': 'Error adding doctor', 'error': str(e)}), 500


@admin_blueprint.route('/api/admin/login', methods=['POST'])
def login_admin():
    with tracer.start_as_current_span("login-admin-handler") as span:
        try:
            with tracer.start_as_current_span("extract-login-data"):
                data = request.json
                email = data.get('email')
                password = data.get('password')
                span.set_attribute("admin_email", email)

            with tracer.start_as_current_span("fetch-admin"):
                admin = Administrator.query.filter_by(email=email).first()

            with tracer.start_as_current_span("verify-password"):
                if admin and bcrypt.check_password_hash(admin.password, password):
                    with tracer.start_as_current_span("generate-access-token"):
                        access_token = create_access_token(
                            identity={'id': admin.id, 'role': 'admin'},
                            expires_delta=timedelta(hours=1)
                        )
                    logger.info("Admin logged in successfully: %s", email)
                    return jsonify({'access_token': access_token}), 200
                else:
                    logger.warning("Invalid login attempt for email: %s", email)
                    span.add_event("Invalid credentials provided")
                    span.set_status(Status(StatusCode.ERROR, "Invalid credentials"))
                    return jsonify({'message': 'Invalid credentials'}), 401
        except Exception as e:
            logger.error("Error during admin login: %s", str(e), exc_info=True)
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Failed to login admin"))
            return jsonify({'message': 'Error during login', 'error': str(e)}), 500
