import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///health_app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'app', 'uploads')
    WTF_CSRF_ENABLED = False
