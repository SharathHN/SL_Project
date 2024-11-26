import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import {jwtDecode} from 'jwt-decode'; // Ensure you have installed jwt-decode with `npm install jwt-decode`


const styles = {
  form: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
  },
  uploadButton: {
    display: "inline-block",
    padding: "10px 15px",
    margin: "20px 0",
    border: "1px solid #007bff",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    textAlign: "center",
  },
  fileInput: {
    display: "none",
  },
  fileName: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
  },
  submitButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};


function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  // Function to decode the JWT and get doctor ID
  const getDoctorIdFromJWT = () => {
    try {
      const token = localStorage.getItem('doctor_access_token'); // Replace with your token key
      if (!token) {
        setMessage('You are not authenticated. Please log in.');
        return null;
      }
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded);
      return decoded.sub.id; // Adjust based on your JWT payload structure
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setMessage('Invalid authentication token.');
      return null;
    }
  };

  // Function to format the Python datetime to "DD-MM-YYYY"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  const [pdfBase64, setPdfBase64] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [patientData, setPatientData] = useState({});

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setFileName(file.name);

    // Convert the file to a Base64 string
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1]; // Remove "data:application/pdf;base64,"
      setPdfBase64(base64String);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (id) => {
    console.log("asdjhkfb", id)
    if (!pdfBase64) {
      alert("No file uploaded.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/doctor/upload-report", {
        method: "POST",
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('doctor_access_token')}`,
        },
        body: JSON.stringify({
          pdf: pdfBase64,
          fileName: fileName,
          appointment_id: id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("PDF uploaded successfully!");
        console.log("Response:", data);
      } else {
        alert("Failed to upload PDF.");
        console.error("Error:", data);
      }
    } catch (error) {
      alert("An error occurred.");
      console.error("Error:", error);
    }
  };


  useEffect(() => {
    const fetchAppointmentsWithPatients = async () => {
      try {
        const token = localStorage.getItem('doctor_access_token'); // Get the token
        const doctorId = getDoctorIdFromJWT(); // Get the doctor ID from the token

        if (!doctorId || !token) {
          console.error('Missing doctor ID or token');
          return;
        }

        // Fetch appointments for the doctor
        const response = await fetch(`http://127.0.0.1:5000/api/doctor/appointments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Add the JWT token
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Merge appointments with patient data
          const mergedAppointments = await Promise.all(
            data.appointments.map(async (appointment) => {
              const patientResponse = await fetch(
                `http://127.0.0.1:5000/api/doctor/patients/${appointment.patient_id}`, // Fetch patient details using patientId
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Add the JWT token
                  },
                }
              );

              if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                console.log("asdikfjhbnkajhsd", appointment.data,appointment)
                return { 
                  ...appointment, 
                  patient_name: patientData.patient.name, // Merge patient name
                  formattedDate: formatDate(appointment.appointment_date) // Format the appointment date
                };
              } else {
                console.error('Failed to fetch patient details for ID:', appointment.patient_id);
                return { 
                  ...appointment, 
                  patient_name: 'Unknown', // Fallback for patient name
                  formattedDate: formatDate(appointment.date) // Add fallback formatted date
                };
              }
            })
          );

          setAppointments(mergedAppointments);
        } else {
          console.error('Failed to fetch appointments.');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointmentsWithPatients();
  }, []);

  const handlePatientForm = (patientId) => {
    // Navigate to the patient's form page using their ID
    navigate(`/patient-form/${patientId}`);
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Doctor Dashboard - Appointments</h2>
      {appointments.length > 0 ? (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={appointment.appointment_id}>
                <td>{index + 1}</td>
                <td>{appointment.patient_name}</td>
                <td>{appointment.formattedDate}</td>
                <td>
                <label htmlFor="pdfUpload" style={styles.uploadButton}>
                    Select PDF
                    <input
                      type="file"
                      id="pdfUpload"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      style={styles.fileInput}
                    />
                  </label>
                  {fileName && <p style={styles.fileName}>Selected File: {fileName}</p>}
                  <button data-info={appointment.appointment_id} onClick={(e)=>{
                    console.log("loggin0", appointment.appointment_id);
                    handleSubmit(appointment.appointment_id)
                  }} style={styles.submitButton}>
                    Upload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-appointments">No appointments available.</div>
      )}
    </div>
  );
}

export default DoctorDashboard;