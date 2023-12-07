import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StudentAttendanceTracker from './StudentAttendanceTracker';

function StudentDashboard({ isLoggedIn }) {
  const navigate = useNavigate();
  const [redirectTimer, setRedirectTimer] = useState(5);
  const studentRegistrationNo = '230350120001';
  const [isTrackerVisible, setIsTrackerVisible] = useState(false);
  // Redirect to login page after 5 seconds
  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setInterval(() => {
        setRedirectTimer(prevTimer => prevTimer - 1);
      }, 1000);

      if (redirectTimer === 0) {
        clearInterval(timer);
        navigate('/studentlogin'); // Redirect to login page
      }

      return () => clearInterval(timer);
    }
  }, [isLoggedIn, redirectTimer, navigate]);

  const handleTrackAttendanceClick = () => {
    setIsTrackerVisible(true); // Show the tracker when the button is clicked
  };

  return (
    <div className="container mt-5">
      {isLoggedIn ? (
        <>
          <h2>Student Dashboard</h2>
          <Link to="/mark-attendance" className="btn btn-primary">Mark Attendance</Link>
          <p></p>
          <Link  to="/track" className="btn btn-primary">Track Attendance</Link>
        </>
      ) : (
        <p>
          Please log in first to access the student dashboard.
          <br />
          <Link to="/studentlogin">Click here to log in</Link>
          {' or '}
          Redirecting you to the login page in {redirectTimer} seconds.
        </p>
      )}
    </div>
  );
}

export default StudentDashboard;