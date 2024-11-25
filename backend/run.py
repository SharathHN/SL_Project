from app import create_app,db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
      # Creates tables only if they do not exist
    app.run(debug=True)
     # Disable debug mode for production
