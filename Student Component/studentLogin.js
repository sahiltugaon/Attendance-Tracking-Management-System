import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StudentLogin({ onLogin, isStudentLoggedIn, isTeacherLoggedIn,saveRegNo }) {
  const navigate = useNavigate();
  const [registrationNo, setRegistrationNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
console.log('registrationNobeforeLogin',registrationNo);
  useEffect(() => {
    if (isStudentLoggedIn) {
      navigate('/student-dashboard');
    } else if (isTeacherLoggedIn) {
      navigate('/teacher-dashboard');
    }
  }, [isStudentLoggedIn, isTeacherLoggedIn]);
  const handleLogin = async () => {
    try {
      const response = await fetch('https://10.104.127.74:5000/api/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationNo, password }),
      });

      if (response.ok) {
        const { authToken } = await response.json();
        localStorage.setItem('studentAuthToken', authToken); // Store token in local storage
        saveRegNo(registrationNo);
        onLogin();
        navigate('/student-dashboard');
      } else {
        setError('Invalid credentials. Please check your registration number and password.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Student Login</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ maxWidth: '300px' }}
          placeholder="Registration No"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control form-control-sm"
          style={{ maxWidth: '300px' }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default StudentLogin;
