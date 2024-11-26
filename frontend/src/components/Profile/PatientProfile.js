import React, {useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Profile.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { globalContext } from '../../App';


const DefaultState = {
  name: "",
  access_token: "",
  blood_group: "",
  blood_pressure: "",
  date_of_birth: "",
  created: "",
  height: "",
  id: "",
  medical_history: "",
  photos: "",
  weight: "",
  email: "",
  medical_id: '123456789',
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  imagePreview: {
    width: "150px",
    height: "150px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain", // Ensures the image scales within the box without distortion
  },
  backButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#006400",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  photoContainer: {
    alignSelf: "center",
  },
  photoPlaceholder: {
    width: "150px",
    height: "150px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "#aaa",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
  photoPreview: {
    width: "150px",
    height: "150px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #ccc",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  inputReadOnly: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    backgroundColor: "#f9f9f9",
    color: "#555",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    minHeight: "80px",
  },
  submitButton: {
    padding: "12px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#006400",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
}

function PatientProfile() {
  const navigate = useNavigate();

  const {globalState, setGlobalState} = useContext(globalContext);


  const [formData, setFormData] = useState(DefaultState);

  useEffect(()=>{
    console.log("empty dep array");
    const appState = localStorage.getItem('globalState');
    if(appState){
      setGlobalState(JSON.parse(appState));
      setFormData(JSON.parse(appState));
    }
  }, []);

  useEffect(()=>{
    // we need to do this but once 
      console.log("28 marks in CS725. FML")
  }, [globalState]);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("putting")
      const response = await fetch("http://127.0.0.1:5000/api/patient/edit-profile", {
        method: "PUT",
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('patient_access_token')}`, // Include the JWT for backend authentication
        },
        body: JSON.stringify({...formData}),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Form Submitted Successfully:", result);
        setFormData({...globalState})
        localStorage.clear();
        navigate('/');
      } else {
        console.error("Error submitting form:", response.statusText);
        localStorage.clear();
        navigate('/');
      }
    } catch (error) {
      console.error("Network Error:", error);
      localStorage.clear();
      navigate('/');
    }
  };


  const handlesPatientLogout = ()=>{
    let storedUserJWT = localStorage.getItem('patient_access_token');
    if(storedUserJWT){
      localStorage.removeItem('patient_access_token');
    }
    setGlobalState((state)=>{
      return (
        DefaultState
      )
    });
    navigate('/');
  }
  const handlesBackButton = () => {
    navigate('/patient-dashboard');
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photos: reader.result, // Store the photo as a base64 string
        }));
      };
      console.log(reader.result)
      reader.readAsDataURL(file);
    }
  };
  const imageSrc = formData.photos;
  console.log("fd", formData);
  console.log(globalState)
  return (
    <div className="patient-profile-container">

      <div className="dashboard-navbar">
      <div className='dashboard-navbar-right'>
          <button className='dashboard-button' onClick={handlesBackButton}>
            <ArrowBackIcon />
          </button>
          </div>
        <h2 className="dashboard-title">Welcome, {globalState['name']}</h2>
        <div className='dashboard-navbar-right'>
          <button className='dashboard-button' onClick={handlesPatientLogout}>
          <LogoutIcon/>
          </button>
        </div>
      </div>
      <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.photoContainer}>
          {formData.photos ? (
            <img
              src={formData.photos}
              alt="Profile"
              style={styles.photoPreview}
            />
          ) : (
            <label htmlFor="photoInput" style={styles.photoPlaceholder}>
              No Photo
            </label>
          )}
          <div style={styles.imagePreview}>
            <img src={imageSrc} alt="Preview" style={styles.image} />
          </div>  
          <input
            type="file"
            id="photoInput"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Contact:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Medical ID:</label>
          <input
            type="text"
            name="medical_id"
            value={formData.medical_id}
            readOnly
            style={styles.inputReadOnly}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Body Weight:</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Height:</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Blood Group:</label>
          <input
            type="text"
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Medical History:</label>
          <textarea
            name="medical_history"
            value={formData.medical_history}
            // onChange={handleChange}
            style={styles.textarea}
            readOnly
          />
        </div>

        <button type="submit" style={styles.submitButton}>
          Edit Profile
        </button>
      </form>
    </div>
    </div>
  );
}

export default PatientProfile;
