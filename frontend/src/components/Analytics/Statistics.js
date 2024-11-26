import React, { useState, useEffect } from 'react';
import '../../styles/Analytics.css';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

function StatisticsDashboard() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('admin_access_token'); // Replace with the appropriate token key
        if (!token) {
          setError('You are not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:5000/api/statistics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Add the JWT token for admin authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
          setLoading(false);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch statistics.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('An error occurred. Please try again later.');
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Pie chart data for doctors by specialization
  const pieData = {
    labels: Object.keys(statistics.doctors_by_specialization),
    datasets: [
      {
        data: Object.values(statistics.doctors_by_specialization),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  // Line chart data for appointments per day
  const lineData = {
    labels: statistics.appointments_per_day.map((appointment) => appointment.date),
    datasets: [
      {
        label: 'Number of Appointments',
        data: statistics.appointments_per_day.map((appointment) => appointment.count),
        fill: false,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="statistics-dashboard">
      <h2 className="dashboard-title">Platform Statistics</h2>

      {statistics && (
        <div className="statistics-content">
          <div className="chart-container">
            <div className="pie-chart">
              <h3>Doctors by Specialization</h3>
              <Pie data={pieData} />
            </div>

            <div className="line-chart">
              <h3>Appointments Per Day</h3>
              <Line data={lineData} />
            </div>
          </div>

          <div className="stat-summary">
            <div className="stat-item">
              <h3>Total Doctors</h3>
              <p>{statistics.total_doctors}</p>
            </div>

            <div className="stat-item">
              <h3>Total Patients</h3>
              <p>{statistics.total_patients}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatisticsDashboard;