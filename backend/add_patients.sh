#!/bin/bash

# Base URL for the API
BASE_URL="http://127.0.0.1:5000"

# Function to register patients
register_patients() {
  echo "Registering 10 patients..."

  for i in {1..10}
  do
    curl -X POST "$BASE_URL/api/patient/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"id\": \"$i\",
      \"name\": \"Patient $i\",
      \"email\": \"patient$i@example.com\",
      \"password\": \"password$i\",
      \"date_of_birth\": \"199${i}-01-0$i\",
      \"height\": $((150 + i)),
      \"weight\": $((50 + i)),
      \"blood_group\": \"O+\",
      \"blood_pressure\": \"120/80\",
      \"medical_history\": \"No known allergies for Patient $i.\"
    }"

    echo -e "\nRegistered Patient $i"
  done
}

# Call the function to register patients
register_patients

echo "All 10 patients registered successfully!"
