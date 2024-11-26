from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from elasticapm import capture_span
import pandas as pd
from sqlalchemy import func, extract
from app.models import Doctor, Patient, Appointment, db
from datetime import datetime
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode

analysis_blueprint = Blueprint('analysis', __name__)
tracer = trace.get_tracer(__name__)

@analysis_blueprint.route('/api/statistics', methods=['GET'])
def get_statistics():
    """
    Fetch statistics including doctor count, doctor types, patient count, and daily appointment count.
    """
    with tracer.start_as_current_span("get_statistics_handler") as span:
        try:
            # Calculate the total number of doctors
            with tracer.start_as_current_span("count_doctors"):
                total_doctors = Doctor.query.count()
                span.set_attribute("total_doctors", total_doctors)

            # Count doctors by specialization
            with tracer.start_as_current_span("count_doctors_by_specialization"):
                specializations = db.session.query(
                    Doctor.specialization, func.count(Doctor.id)
                ).group_by(Doctor.specialization).all()
                doctors_by_specialization = {
                    specialization or "Not Specified": count for specialization, count in specializations
                }
                span.set_attribute("specializations_count", len(doctors_by_specialization))

            # Calculate the total number of patients
            with tracer.start_as_current_span("count_patients"):
                total_patients = Patient.query.count()
                span.set_attribute("total_patients", total_patients)

            # Count appointments made per day
            with tracer.start_as_current_span("count_appointments_per_day"):
                appointments_per_day = db.session.query(
                    func.date(Appointment.appointment_date),
                    func.count(Appointment.id)
                ).group_by(func.date(Appointment.appointment_date)).all()
                daily_appointments = [
                    {"date": str(date), "count": count} for date, count in appointments_per_day
                ]
                span.set_attribute("appointments_count", len(daily_appointments))

            # Compile the response
            with tracer.start_as_current_span("compile_response"):
                response = {
                    "total_doctors": total_doctors,
                    "doctors_by_specialization": doctors_by_specialization,
                    "total_patients": total_patients,
                    "appointments_per_day": daily_appointments
                }
                span.set_status(Status(StatusCode.OK))
                return jsonify(response), 200

        except Exception as e:
            # Record the exception in tracing
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, "Failed to fetch statistics"))
            return jsonify({'message': 'Error fetching statistics', 'error': str(e)}), 500