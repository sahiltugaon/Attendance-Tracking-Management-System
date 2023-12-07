import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import axios from 'axios';

// ... (import statements)

function AttendanceForm() {
  const { subject } = useParams();
  const [registrationNo, setRegistrationNo] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState([]);

  useEffect(() => {
    fetchRegisteredStudents();
  }, [subject]);

  const fetchRegisteredStudents = async () => {
    try {
      const response = await axios.get('https://10.104.127.74:5000/api/getRegistrationNosWithNames');
      setRegisteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching registered students:', error);
    }
  };

  const generateQRCode = () => {
    const selectedStudent = registeredStudents.find(student => student.RegNo.toString() === registrationNo);

    if (!selectedStudent) {

      setErrorMessage('Please select a valid student.');
      return;
    }
    const currentDate = new Date();
     const date = currentDate.getDate();
     const month = currentDate.getMonth() + 1; // Add 1 to get the correct month number
    const year = currentDate.getFullYear();

   // Use a function to add leading zeros
    const addLeadingZero = (value) => (value < 10 ? `0${value}` : value);

    const formattedDate = `${addLeadingZero(date)}/${addLeadingZero(month)}/${year}`;
    console.log('formattedDate',formattedDate);
    const generatedQRCode = `Registration No: ${selectedStudent.RegNo} Subject: ${subject} Date: ${formattedDate}`;
    setQrCode(generatedQRCode);
    setErrorMessage('');

  };

  return (
    <div className="container mt-5">
      <h2>Attendance Form - {subject}</h2>
      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Student Registration No"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
        />
        {errorMessage && <div className="text-danger">{errorMessage}</div>}
      </div>
      <div className="mb-3">
        <select
          className="form-select"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
        >
          <option value="">Select a student</option>
          {registeredStudents.map(student => (
            <option key={student.RegNo} value={student.RegNo}>
              {student.RegNo}-{student.FirstName} {student.LastName} 
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={generateQRCode}>Generate QR Code</button>
      </div>
      {qrCode && (
        <div className="text-center">
          <QRCode value={qrCode} size={200} />
        </div>
      )}
    </div>
  );
}

export default AttendanceForm;