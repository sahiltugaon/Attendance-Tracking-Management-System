import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import StudentForm from './ReactQR/studentForm';
import TeacherLogin from './ATMS/Teacher Component/teacherlogin';
import './ReactQR/App.css'
import StudentTable from './ReactQR/studenttable';
import QRScanner from './ATMS/Student Component/QRScanner';
import TeacherDashboard from './ATMS/Teacher Component/teacherdashboard'
import AttendanceForm from './ATMS/Teacher Component/attendanceForm';
import StudentLogin from './ATMS/Student Component/studentLogin';
import StudentDashboard from './ATMS/Student Component/studentdashboard';
import ScannedQRList from './ATMS/Teacher Component/scannedQRCodes';
import AttendanceTracker from './ATMS/Teacher Component/attandenceTracker';
import StudentAttendanceTracker from './ATMS/Student Component/StudentAttendanceTracker';


function HomePage() {
  return (
    <div className="home-page">
      <h1 style={{color:"red"}}>Welcome to Attendance Management & Tracking System</h1>
      <p>Efficiently manage attendance records and track student participation.</p>
      <div className="btn-container">
        <Link to="/teacher-dashboard" className="btn btn-primary">Teacher Dashboard</Link><p></p>
        <Link to="/student-dashboard" className="btn btn-primary">Student Dashboard</Link>
      </div>
    </div>
  );
}

function App() {
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [studentRegNo, setStudentRegNo]=useState('');
  const navigate=useNavigate();

  //console.log('registrationNobeforeLogin',studentRegNo);

  useEffect(() => {
    const teacherAuthToken = localStorage.getItem('teacherAuthToken');
    const studentAuthToken=localStorage.getItem('studentAuthToken');
    if (teacherAuthToken) {
      console.log('Teacher logged in with token:', teacherAuthToken);
      setIsTeacherLoggedIn(true);
    }
    if (studentAuthToken) {
      console.log('Student logged in with token:', studentAuthToken);
      setIsStudentLoggedIn(true);
    }
  }, []);

  useEffect(() => {
   // console.log('registrationNoAfterLogininuseeffect', studentRegNo);
  }, [studentRegNo]);
  
  const handleStudentRegistration=(registrationNo)=>{
    setStudentRegNo(registrationNo);
   // console.log('registrationNoAfterLogin',studentRegNo);
  }

  const handleTeacherLogin = () => {
    setIsTeacherLoggedIn(true);
  };

  const handleStudentLogin = () => {
    setIsStudentLoggedIn(true);
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('studentAuthToken');
    setIsStudentLoggedIn(false);
  };

  const handleTeacherLogout = () => {
    localStorage.removeItem('teacherAuthToken');
    setIsTeacherLoggedIn(false);
  };
  const handleLogout=()=>{
    if(isStudentLoggedIn){
      localStorage.removeItem('studentAuthToken');
      setIsStudentLoggedIn(false);
      navigate('/studentlogin');
    }else if(isTeacherLoggedIn){
      localStorage.removeItem('teacherAuthToken');
      setIsTeacherLoggedIn(false);
      navigate('/teacherLogin');
    }
  }


  return (
      <>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossOrigin="anonymous"></link>

        <nav className="navbar navbar-expand">
          <div className="container">
            {/* ... */}
            <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/student-table">Students Info</Link>
                </li>
              </ul>
              <ul className="navbar-nav">
              {(isStudentLoggedIn || isTeacherLoggedIn) ? (
             <li className="nav-item">
             <button className="nav-link" onClick={handleLogout}>Logout</button>
            </li>
            ) : (
            <>
            <li className="nav-item">
           <Link className="nav-link" to="/studentlogin">Student Login</Link>
           </li>
            <li className="nav-item">
            <Link className="nav-link" to="/teacherLogin">Teacher Login</Link>
            </li>
             </>
             )}
             </ul>

            </div>
          </div>
        </nav>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossOrigin="anonymous"></script>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student-table" element={<StudentTable />} />
          <Route
    path="/studentlogin"
    element={<StudentLogin onLogin={handleStudentLogin} isStudentLoggedIn={isStudentLoggedIn} isTeacherLoggedIn={isTeacherLoggedIn} saveRegNo={handleStudentRegistration} />}
  />
  <Route
    path="/teacherLogin"
    element={<TeacherLogin onLogin={handleTeacherLogin} isStudentLoggedIn={isStudentLoggedIn} isTeacherLoggedIn={isTeacherLoggedIn} />}
  />
          {/* Pass isLoggedIn prop to components */}
        <Route
          path='/teacher-dashboard'
          element={<TeacherDashboard isLoggedIn={isTeacherLoggedIn} onLogout={handleTeacherLogout} />}
        />
        <Route
          path='/student-dashboard'
          element={<StudentDashboard isLoggedIn={isStudentLoggedIn} />}
        />
          <Route path="/attendance-form/:subject" element={<AttendanceForm />} />
          <Route path='/mark-attendance' element={<QRScanner RegNo={studentRegNo}/>}/>
          <Route path='/scanned-qr-list' element={<ScannedQRList></ScannedQRList>}/>
          <Route path='/trackattendance' element={<AttendanceTracker></AttendanceTracker>}/>
          <Route path='/track' element={<StudentAttendanceTracker studentRegistrationNo={studentRegNo} />}/>
        </Routes>
      </div>
      </>
  );
}

export default App;
