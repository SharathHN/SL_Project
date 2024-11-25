import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
// import Login from './components/Auth/Login';
import DoctorLogin from './components/Auth/Login/DoctorLogin';
import PatientLogin from './components/Auth/Login/PatientLogin';
import AdminLogin from './components/Auth/Login/AdminLogin';
import PatientSignUp from './components/Auth/SignUp/PatientSignUp';
import DoctorSignUp from './components/Auth/SignUp/DoctorSignUp';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import PatientProfile from './components/Profile/PatientProfile';
import DoctorProfile from './components/Profile/DoctorProfile';
import ScheduleAppointment from './components/Appointments/ScheduleAppointment';
import Reports from './components/Reports/Reports';
import ReportSummarization from './components/Reports/ReportSummarization';
import Statistics from './components/Analytics/Statistics';
import NotFound from './components/NotFound';
import ManageDoctors from './components/Admin/manage-doctor';
import AddDoctor from './components/Admin/AddDoctor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/patient-signup" element={<PatientSignUp />} />
        <Route path="/doctor-signup" element={<DoctorSignUp />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/patient-profile" element={<PatientProfile />} />
        <Route path="/doctor-profile" element={<DoctorProfile />} />
        <Route path="/schedule-appointment" element={<ScheduleAppointment />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/summarize-report" element={<ReportSummarization />} />
        <Route path="/admin-dashboard/statistics" element={<Statistics />} />
        <Route path="/admin-dashboard/manage-doctors" element={<ManageDoctors />} />
        <Route path="/admin-dashboard/manage-doctors/add-doctor" element={<AddDoctor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
