import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email, password) => {
  return await axios.post(`${API_URL}/api/login`, { email, password });
};

export const register = async (userData) => {
  return await axios.post(`${API_URL}/api/register`, userData);
};

export const downloadReport = async (reportId, token) => {
  return await axios.get(`${API_URL}/api/download-report/${reportId}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob', // Ensure the response is treated as a file
  });
};

export const assignDoctor = async (appointmentId, doctorId, token) => {
  return await axios.post(
    `${API_URL}/api/admin/assign-patient/${appointmentId}`,
    { doctor_id: doctorId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
