
from .doctor_routes import doctor_blueprint
from .patient_routes import patient_blueprint
from .analysis_routes import analysis_blueprint
from .admin_routes import admin_blueprint
from .appointment_routes import appointment_blueprint

__all__ = [ 'doctor_blueprint', 'patient_blueprint', 'analysis_blueprint', 'admin_blueprint','appoint_blueprint']
