import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './teacher.css'

function TeacherDashboard({isLoggedIn, onLogout}) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const navigate = useNavigate();
  const [authtoken, setAuthToken] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(5); // Initialize the timer

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('teacherAuthToken');
        if (!token) {
          setAuthToken(false);
          // Use functional update to ensure the latest state value is used
          setTimeout(() => {
            setRedirectTimer(prevTimer => prevTimer - 1);
          }, 1000);

          // Clear timer and navigate when timer reaches zero
          if (redirectTimer === 0) {
            onLogout(); 
            navigate('/teacherlogin'); // Redirect to login page
          }
        } else {
          const response = await fetch('https://10.104.127.74:5000/api/check-session', {
            method: 'GET',
            headers: {
              'Authorization': token, // Include token in the request header
            },
          });

          if (response.ok) {
            setAuthToken(true);
          } else {
            setAuthToken(false);
            onLogout(); 
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession(); // Always check session status on component mount

  }, [navigate, redirectTimer]); // Include navigate and redirectTimer in the dependencies

  return (
    <div>
      {authtoken ? (
        <>
          <h1>Teacher Dashboard</h1>
          <h3>Select a Subject:</h3>
          <ul>
            <li>
              <Link to={`/attendance-form/java`} onClick={() => setSelectedSubject('Java')}>
                Java
              </Link>
            </li>
            <li>
              <Link to={`/attendance-form/dotnet`} onClick={() => setSelectedSubject('.NET')}>
                .NET
              </Link>
            </li>
            <li>
              <Link to={`/attendance-form/operating-system`} onClick={() => setSelectedSubject('Operating System')}>
                Operating System
              </Link>
            </li>
            {/* Add more subjects here */}
          </ul>
          <ul >
            <li>
            <Link to="/scanned-qr-list" className="btn btn-primary">Track QR Scanned History</Link>
            </li>
          </ul>
          <ul >
            <li>
            <Link to="/trackattendance" className="btn btn-primary">Track Attendance</Link>
            </li>
          </ul>
        </>
      ) : (
        <p>
          Please log in first to access the teacher dashboard.
          <br />
          <Link to="/teacherlogin">Click here to log in</Link>
          {' or '}
          Redirecting you to the login page in {redirectTimer} seconds.
        </p>
      )}
    </div>
  );
}

export default TeacherDashboard;
