import React from 'react';
import '../../styles/Analytics.css';

function Statistics() {
  return (
    <div className="analytics-container">
      <h2>Platform Statistics</h2>
      <div className="statistics-cards">
        <div className="card">
          <h3>Total Doctors</h3>
          <p>15</p>
        </div>
        <div className="card">
          <h3>Total Patients</h3>
          <p>150</p>
        </div>
        <div className="card">
          <h3>Doctor-Patient Ratio</h3>
          <p>1:10</p>
        </div>
        <div className="card">
          <h3>Appointments This Month</h3>
          <p>45</p>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
