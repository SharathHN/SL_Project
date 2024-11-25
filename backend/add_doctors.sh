#!/bin/bash

# Set the base URL for your API
BASE_URL="http://127.0.0.1:5000"
# Updated Admin JWT Token
ADMIN_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczMTgyODg2MSwianRpIjoiYzQ0NjBjMjItODNmNi00ZmE0LWJjMmItOGYwODA0N2UxZTcwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJpZCI6MSwicm9sZSI6ImFkbWluIn0sIm5iZiI6MTczMTgyODg2MSwiY3NyZiI6ImYzYTE1MmIzLWNjMmQtNGZiOS05MDRlLWM1N2JmYWY5MDQ4ZSIsImV4cCI6MTczMTgzMjQ2MX0.jIzQW2OsyAvAxB-RryPAGPg6i-XHLgyDolnWKx9zAKQ"

# Function to add doctors
add_doctors() {
  echo "Adding doctors with number_of_appointments..."

  curl -X POST "$BASE_URL/api/admin/add-doctor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Dr. Emily Watson",
    "email": "emily.watson@example.com",
    "password": "emilypassword",
    "license_number": "DOC67890",
    "specialization": "Cardiology",
    "date_of_birth": "1985-07-15",
    "number_of_appointments": 25
  }'

  curl -X POST "$BASE_URL/api/admin/add-doctor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Dr. Michael Brown",
    "email": "michael.brown@example.com",
    "password": "michaelpassword",
    "license_number": "DOC34567",
    "specialization": "Orthopedics",
    "date_of_birth": "1978-03-20",
    "number_of_appointments": 40
  }'

  curl -X POST "$BASE_URL/api/admin/add-doctor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Dr. Olivia Davis",
    "email": "olivia.davis@example.com",
    "password": "oliviapassword",
    "license_number": "DOC98765",
    "specialization": "Cardiology",
    "date_of_birth": "1990-11-02",
    "number_of_appointments": 15
  }'
}

# Add doctors
add_doctors

echo "Doctors added successfully!"
