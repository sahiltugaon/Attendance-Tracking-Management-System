import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TeacherLogin({ onLogin, isStudentLoggedIn, isTeacherLoggedIn }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  useEffect(() => {
    if (isStudentLoggedIn) {
      navigate('/student-dashboard');
    } else if (isTeacherLoggedIn) {
      navigate('/teacher-dashboard');
    }
  }, [isStudentLoggedIn, isTeacherLoggedIn]);
  

  const handleLogin = async () => {
    try {
      const response = await fetch('https://10.104.127.74:5000/api/teacher/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Save JWT token to local storage
        localStorage.setItem('teacherAuthToken', data.token);
        onLogin();
        // Redirect to dashboard after successful login
        navigate('/teacher-dashboard');
      } else {
        setError('Invalid credentials. Please check your username and password.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
  };
  
  return (
    <div className="container mt-5">
      <h1>Teacher Login</h1>
      {error && <p className="alert alert-danger">{error}</p>}
      <div className="mb-3">
        <input type="text" className="form-control form-control-sm" style={{ maxWidth: '300px' }} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="mb-3">
        <input type="password" className="form-control form-control-sm" style={{ maxWidth: '300px' }} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleLogin}>Login</button>
    </div>
  );
}

export default TeacherLogin;
