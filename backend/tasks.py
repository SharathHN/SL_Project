from celery import Celery
from app import create_app, db
from app.models import User, Appointment
from datetime import datetime

celery = Celery('tasks')
celery.config_from_object('celeryconfig')

@celery.task
def assign_doctors():
    app = create_app()
    with app.app_context():
        # Get all unassigned appointments
        unassigned_appointments = Appointment.query.filter_by(doctor_id=None).all()
        doctors = User.query.filter_by(role='doctor').all()

        if not doctors:
            print("No doctors available")
            return

        for appointment in unassigned_appointments:
            # Simple round-robin assignment (you can implement more complex logic based on specialization, load, etc.)
            assigned_doctor = doctors[appointment.patient_id % len(doctors)]
            appointment.doctor_id = assigned_doctor.id
            db.session.commit()
            print(f"Assigned Doctor {assigned_doctor.name} to Appointment {appointment.id}")
