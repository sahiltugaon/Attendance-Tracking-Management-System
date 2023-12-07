import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentAttendanceTracker({ studentRegistrationNo }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const[errorState,setErrorState]=useState('');

  useEffect(() => {
    //fetchStudentAttendance();
  }, [studentRegistrationNo][errorState]);

  const fetchStudentAttendance = async () => {
    try {
      const queryParams = new URLSearchParams({
        month: selectedMonth,
        subject: selectedSubject,
      });

      const response = await axios.get(`https://10.104.127.74:5000/student-attendance/${studentRegistrationNo}?${queryParams}`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      setErrorState('Error fetching student attendance:');
    }
  };

  const renderAttendanceTable = () => {
    const rows = [];

    if (selectedMonth) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const [year, month] = selectedMonth.split('-');

      const daysInMonth = new Date(year, parseInt(month), 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const formattedDate = `${day}/${month}/${year}`;

        const attendanceStatus = renderAttendanceStatus(formattedDate, selectedSubject);
        const cellClass = attendanceStatus === 'Present' ? 'present-cell' : 'absent-cell';

        rows.push(
          <tr key={formattedDate}>
            <td>{formattedDate}</td>
            <td>{selectedSubject}</td>
            <td id={cellClass}>{attendanceStatus}</td>
          </tr>
        );
      }
    }

    return rows;
  };

  const renderAttendanceStatus = (date, subject) => {
    const entry = attendanceData.find(
      entry => entry.date === date && entry.subject === subject
    );
    return entry ? 'Present' : 'Absent';
  };

  return (
    <div className="student-attendance">
      <h2>Your Attendance Records</h2>
      <div className="attendance-filters">
      <div className="col-md-2">
         <input
           type="date"
           className="form-control"
           placeholder="Date"
           value={selectedDate}
           onChange={(e) => setSelectedDate(e.target.value)}
           />
          </div>
        <label>
          Select Month:
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control"
          />
        </label>
        <label>
          Select Subject:
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-select"
          >
            <option value="">All Subjects</option>
            <option value="java">Java</option>
            <option value="dotnet">Dotnet</option>
            <option value="operating-system">Operating-System</option>
            {/* Add more subjects */}
          </select>
        </label>
        <button className="btn btn-primary" onClick={fetchStudentAttendance}>
          Apply Filters
        </button>
      </div>
      {errorState && <div className="alert alert-danger mt-3">{errorState}</div>}
      <table className="table table-bordered table-striped mt-3">
        <thead>
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Attendance</th>
          </tr>
        </thead>
        <tbody>{renderAttendanceTable()}</tbody>
      </table>
    </div>
  );
}

export default StudentAttendanceTracker;
