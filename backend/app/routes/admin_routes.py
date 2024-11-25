from flask import Blueprint, request, jsonify
from app.models import Doctor, db, Administrator
from flask_jwt_extended import jwt_required, get_jwt_identity,create_access_token
from .. import bcrypt
from elasticapm import capture_span
from datetime import timedelta,datetime
import uuid


admin_blueprint = Blueprint('admin', __name__)

@admin_blueprint.route('/api/admin/add-doctor', methods=['POST'])
@jwt_required()
@capture_span()
def add_doctor():
    try:
        # Verify if the current user is an admin
        user_role = get_jwt_identity().get('role')
        if user_role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403

        # Get doctor information from the request
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        license_number = data.get('license')
        specialization = data.get('specialization')
        date_of_birth = data.get('date_of_birth')

        if date_of_birth:
            date_of_birth = datetime.strptime(date_of_birth, "%Y-%m-%d").date()



        # Check if a doctor with the same email or license number already exists
        if Doctor.query.filter((Doctor.email == email) | (Doctor.license_number == license_number)).first():
            return jsonify({'message': 'Doctor already exists with this email or license number'}), 409

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        # Create a new Doctor record
        new_doctor = Doctor(
            id = str(uuid.uuid4()),
            name=name,
            email=email,
            password=hashed_password,
            license_number=license_number,
            specialization=specialization,
            date_of_birth=date_of_birth
        )
        print(id)

       
        db.session.add(new_doctor)
        db.session.commit()

        return jsonify({'message': 'Doctor added successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error adding doctor', 'error': str(e)}), 500


@admin_blueprint.route('/api/admin/login', methods=['POST'])
@capture_span()
def login_admin():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # Retrieve the admin by email
        admin = Administrator.query.filter_by(email=email).first()
        print(admin)

        # Verify the password
        if admin and bcrypt.check_password_hash(admin.password, password):
            # Create a JWT token for the admin
            access_token = create_access_token(identity={'id': admin.id, 'role': 'admin'}, expires_delta=timedelta(hours=1))
            print(access_token)
            return jsonify({'access_token': access_token}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': 'Error during login', 'error': str(e)}), 500