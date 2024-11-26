import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';

const AdminDashboard = ()=>{
  const storedUserJWT = localStorage.getItem('admin_access_token');
  const navigate = useNavigate('/');
  useEffect(()=>{
    if(!storedUserJWT){
      console.log('Rerouting to default route');
      navigate('/');
    }
  }, []);
  

  const handlesAdminLogout = ()=>{
    let storedUserJWT = localStorage.getItem('admin_access_token');
    if(storedUserJWT){
      localStorage.removeItem('admin_access_token');
    }
    navigate('/');
  }

  return (
    <div className="dashboard">
      <div className="dashboard-navbar">
      <h2 className="dashboard-title">Admin Dashboard</h2>
      <div className='dashboard-navbar-right'>
        <button className='dashboard-button' onClick={handlesAdminLogout}>
          Log out
        </button>
      </div>
      </div>
      <div className="dashboard-buttons">
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/admin-dashboard/manage-doctors')} // Updated URL for Manage Doctors section
        >
          Manage Doctors
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/patient-assignment')}
        >
          Patient Assignment
        </button>
        <button 
          className="dashboard-button" 
          onClick={() => navigate('/view-statistics')}
        >
          View Statistics
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
