import React, {useEffect, useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom'; // Assumes React Router is used for navigation
import '../../styles/Dashboard.css';
import LogoutIcon from '@mui/icons-material/Logout';
import { globalContext } from '../../App'


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


function PatientDashboard() {

  // const [formData, setFormData] = useState({
  //   "username"
  // });


  const {globalState, setGlobalState} = useContext(globalContext);
  const storedUserJWT = localStorage.getItem('patient_access_token');
  const navigate = useNavigate('/');
  
  console.log(globalState['name'])

    useEffect(()=>{
        const appState = localStorage.getItem("globalState");
        console.log("jkanslkfjn ", appState)
        if(appState){
          console.log("default use effect");
          setGlobalState(JSON.parse(appState));
        }
    }, []);


    useEffect(()=>{
      if(!storedUserJWT){
        console.log('Rerouting to default route');
        navigate('/');
      }
      console.log("Global State useeffect");
    }, [globalState]);
    

    const handlesPatientLogout = ()=>{
      let storedUserJWT = localStorage.getItem('patient_access_token');
      if(storedUserJWT){
        localStorage.removeItem('patient_access_token');
      }
      setGlobalState((state)=>{
        return (
          DefaultState
        )
      })
      navigate('/');
    }
  


  return (
    <div className="dashboard">
      <div className="dashboard-navbar">
      
        <h2 className="dashboard-title">Welcome, {globalState['name']}</h2>
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
            navigate('/view-report');

          }}
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
