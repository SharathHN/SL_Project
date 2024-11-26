import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Appointment, Doctor, Patient
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode
from app import model_base,tokenizer

# Initialize structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AppointmentAPI")

appointment_blueprint = Blueprint('appointment_blueprint', __name__)
tracer = trace.get_tracer(__name__)

def calculate_priority_score(notes):
        # Chat-style prompt
        prompt = (
            "Assistant: I am a medical assistant. I will help assess the severity of the patient's condition.\n"
            "User: Here are the patient notes: {notes}\n"
            "Assistant: Based on the notes provided, the severity score on a scale of 1 to 10  with less severe 1 and more being 10is:\n"
            f"Patient Notes: {notes}\n"
            "Severity Score:"
        )

        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt")

        # Generate text (use a small max_length to limit the response)
        outputs = model_base.generate(
            inputs["input_ids"],
            max_length=inputs["input_ids"].shape[1] + 3,  # Allow 5 tokens for the score
            num_return_sequences=1,
            do_sample=False
        )

        # Decode the generated text
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Generated Text:\n{generated_text}")

        # Extract the severity score
        score_text = generated_text.split("Severity Score:")[-1].strip()
        severity_score = float(score_text)

        # Ensure the score is within the range [0, 10]
        return max(0, min(10, severity_score))

@appointment_blueprint.route('/api/request-appointment', methods=['POST'])
@jwt_required()
def request_appointment():
    with tracer.start_as_current_span("request_appointment") as span:
        try:
            current_user = get_jwt_identity()
            span.set_attribute("current_user.role", current_user['role'])
            span.set_attribute("current_user.id", current_user['id'])

            if current_user['role'] != 'patient':
                logger.warning("Unauthorized access attempt by user: %s", current_user['id'])
                span.add_event("Unauthorized access attempt")
                span.set_status(Status(StatusCode.ERROR, "Unauthorized access"))
                return jsonify({'message': 'Unauthorized'}), 403

            data = request.json
            doctor_id = data.get('doctor_id')
            patient_id = current_user['id']
            notes = data.get('notes', "")

            span.set_attributes({
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "notes": notes
            })

            if not doctor_id:
                logger.warning("Missing doctor_id in appointment request by patient: %s", patient_id)
                span.add_event("Missing required fields")
                span.set_status(Status(StatusCode.ERROR, "Missing doctor_id"))
                return jsonify({'message': 'Missing required fields'}), 400

            with tracer.start_as_current_span("calculate_priority"):
                priority_score = calculate_priority_score(notes)

            with tracer.start_as_current_span("create_appointment"):
                new_appointment = Appointment(
                    doctor_id=doctor_id,
                    patient_id=patient_id,
                    notes=notes,
                    priority_score=priority_score,
                    status="requested"
                )
                db.session.add(new_appointment)
                db.session.commit()

            span.set_attribute("output.priority_score", priority_score)
            logger.info("Appointment requested successfully for patient: %s with priority score: %d", patient_id, priority_score)
            return jsonify({'message': 'Appointment requested successfully', 'priority_score': priority_score}), 201
        except Exception as e:
            logger.error("Error requesting appointment for patient: %s, error: %s", current_user['id'], str(e), exc_info=True)
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Failed to request appointment"))
            return jsonify({'message': 'Error requesting appointment', 'error': str(e)}), 500


@appointment_blueprint.route('/api/appointments/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_appointments_for_particular_patient(patient_id):
    with tracer.start_as_current_span("get_appointments_for_patient") as span:
        try:
            current_user = get_jwt_identity()
            span.set_attribute("current_user.role", current_user['role'])
            span.set_attribute("current_user.id", current_user['id'])
            span.set_attribute("input.patient_id", patient_id)

            if current_user['role'] not in ['patient', 'admin']:
                logger.warning("Unauthorized access attempt by user: %s", current_user['id'])
                span.add_event("Unauthorized access attempt")
                span.set_status(Status(StatusCode.ERROR, "Unauthorized access"))
                return jsonify({'message': 'Unauthorized'}), 403

            if current_user['role'] == 'patient' and current_user['id'] != patient_id:
                logger.warning("Patient %s tried to access another patient's appointments: %s", current_user['id'], patient_id)
                span.add_event("Unauthorized patient access attempt")
                span.set_status(Status(StatusCode.ERROR, "Unauthorized patient access"))
                return jsonify({'message': 'Unauthorized'}), 403

            with tracer.start_as_current_span("fetch_appointments"):
                appointments = Appointment.query.filter_by(patient_id=patient_id).all()

            if not appointments:
                logger.info("No appointments found for patient: %s", patient_id)
                span.add_event("No appointments found")
                span.set_status(Status(StatusCode.ERROR, "No appointments found"))
                return jsonify({'message': 'No appointments found for this patient'}), 404

            with tracer.start_as_current_span("format_appointment_data"):
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

            span.set_attribute("output.appointments_count", len(appointment_list))
            logger.info("Fetched %d appointments for patient: %s", len(appointment_list), patient_id)
            return jsonify({'appointments': appointment_list}), 200
        except Exception as e:
            logger.error("Error fetching appointments for patient: %s, error: %s", patient_id, str(e), exc_info=True)
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Failed to fetch appointments"))
            return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500
