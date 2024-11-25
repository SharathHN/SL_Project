from app import db, bcrypt
# from werkzeug.security import safe_str_cmp
from app.models import Administrator as Admin

def seed_admin():
    # Check if an admin already exists
    admin_email = "admin@example.com"
    if Admin.query.filter_by(email=admin_email).first():
        print("Admin already exists.")
    else:
        # Create a new admin
        name = "Default Admin"
        email = admin_email
        password = "adminpassword"  # Change to a secure password or use environment variables
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_admin = Admin(name=name, email=email, password=hashed_password)
        db.session.add(new_admin)
        db.session.commit()

        print("Admin seeded successfully.")

if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_admin()
