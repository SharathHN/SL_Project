import React, {createContext, useState} from 'react';
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
import DoctorList from './components/Admin/DoctorList';

const globalContext = createContext()

function App() {

  const [globalState, setGlobalState] = useState({
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
  });

  return (
    <globalContext.Provider value= {{globalState, setGlobalState}}>
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
            <Route path='/view-report' element={<Reports/>} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/about-me" element={<PatientProfile />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/schedule-appointment" element={<ScheduleAppointment />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/summarize-report" element={<ReportSummarization />} />
            <Route path="/admin-dashboard/view-statistics" element={<Statistics />} />
            <Route path="/admin-dashboard/manage-doctors" element={<ManageDoctors />} />
            <Route path="/admin-dashboard/manage-doctors/view-all-doctors" element={<DoctorList/>} />
            <Route path="/admin-dashboard/manage-doctors/add-doctor" element={<AddDoctor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
    </ globalContext.Provider >
  );
}

export default App;
export {globalContext};

