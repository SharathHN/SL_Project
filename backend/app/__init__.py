from flask import Flask, jsonify
from elasticapm.contrib.flask import ElasticAPM
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from datetime import timedelta

from config import Config
import os
import elasticapm
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from flask import Flask

from transformers import AutoTokenizer, AutoModelForCausalLM

# Load GPT-2 model and tokenizer
MODEL_NAME = "TinyLlama/TinyLlama_v1.1"  # You can replace this with a lightweight decoder model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model_base = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
print(model_base)

def setup_tracer(app: Flask):
    resource = Resource(attributes={
    "service.name": "MedVault"  # Replace with your service name
    })
    # Initialize tracer provider
    trace.set_tracer_provider(TracerProvider(resource=resource))
    tracer_provider = trace.get_tracer_provider()

    # Configure Jaeger Exporter
    jaeger_exporter = JaegerExporter(
        agent_host_name="localhost",  
        agent_port=6831              
    )

    # Add BatchSpanProcessor
    span_processor = BatchSpanProcessor(jaeger_exporter)
    tracer_provider.add_span_processor(span_processor)

    # Instrument the Flask app
    FlaskInstrumentor().instrument_app(app)

    return trace.get_tracer(__name__)

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config["OPENTELEMETRY_SERVICE_NAME"] = "MedVault" 
    

    CORS(app)

    # Create upload directory if it doesn't exist
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # Initialize APM
    app.config['ELASTIC_APM'] = {
        'SERVICE_NAME': 'health-api',
        'SERVER_URL': 'http://localhost:8200',
        'ENVIRONMENT': 'production',
    }

    # Initialize database and extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    


    # Set security headers
    @app.after_request
    def set_security_headers(response):
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Content-Security-Policy'] = "default-src 'self';"
        return response

    # Set up rate limiting
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"]
    )
    from .routes import  doctor_blueprint, patient_blueprint, analysis_blueprint, admin_blueprint, appointment_blueprint
    # Register blueprints
    app.register_blueprint(doctor_blueprint)
    app.register_blueprint(patient_blueprint)
    app.register_blueprint(analysis_blueprint)
    app.register_blueprint(admin_blueprint)
    app.register_blueprint(appointment_blueprint)

    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500

    return app
