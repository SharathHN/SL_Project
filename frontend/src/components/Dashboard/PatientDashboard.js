import React, {useEffect, useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom'; // Assumes React Router is used for navigation
import '../../styles/Dashboard.css';
import LogoutIcon from '@mui/icons-material/Logout';
import { globalContext } from '../../App'

function PatientDashboard() {

  // const [formData, setFormData] = useState({
  //   "username"
  // });


  const {globalState, setGlobalState} = useContext(globalContext);
  const storedUserJWT = localStorage.getItem('patient_access_token');
  const navigate = useNavigate('/');
  
  useEffect(()=>{
    if(!storedUserJWT){
      console.log('Rerouting to default route');
      navigate('/');
    }
  }, [globalState]);
  

  const handlesPatientLogout = ()=>{
    let storedUserJWT = localStorage.getItem('patient_access_token');
    if(storedUserJWT){
      localStorage.removeItem('patient_access_token');
    }
    navigate('/');
  }

  return (
    <div className="dashboard">
      <div className="dashboard-navbar">
        <h2 className="dashboard-title">Welcome, {}</h2>
        <div className='dashboard-navbar-right'>
          <button className='dashboard-button' onClick={handlesPatientLogout}>
          <LogoutIcon/>
          </button>
        </div>
      </div>
      <div className="dashboard-buttons">
        <button 
          className="dashboard-button" 
          onClick={()=>{
            // navigate('view-reports');
            // setGlobalContext("Demo test");
          }} // URL for View Reports section
        >
          View Reports
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/schedule-appointment')} // URL for Request Appointment section
        >
          Request Appointment
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/about-me')} // URL for About Me/Profile Settings section
        >
          About Me
        </button>
      </div>
    </div>
  );
}

export default PatientDashboard;
