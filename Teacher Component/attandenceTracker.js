import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './teacher.css';

function AttendanceTracker() {
  const [registrationNoOptions, setRegistrationNoOptions] = useState([]);
  const [registrationNo, setRegistrationNo] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false); 
  const [isFetchButtonClicked, setIsFetchButtonClicked] = useState(false);

  const fetchRegistrationNos = async () => {
    try {
      const response = await axios.get('https://10.104.127.74:5000/api/getRegistrationNosWithNames'); // Replace with your actual endpoint
      setRegistrationNoOptions(response.data);
    } catch (error) {
      console.error('Error fetching registration numbers:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsFetchingAttendance(true);
      setAttendanceData([]);
      let requestData = {
        registrationNo,
        subject,
        year,
        month,
      };
  
      // Add selectedDate to requestData if it's not empty
      if (selectedDate) {
        requestData.date = selectedDate;
      }
  
      const response = await axios.post('https://10.104.127.74:5000/api/getAttendance', requestData);
  
      console.log('Response Data:', response.data);
  
      setAttendanceData(response.data);
      setIsFetchButtonClicked(true);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsFetchingAttendance(false);
    }
  };

  const parseDateString = dateString => {
    const [day, month, year] = dateString.split('/');
    const parsedDate = new Date(year, month - 1, day).getDate();
    console.log('EntryDate', parsedDate);
    return parsedDate;
  };
  

  const renderAttendanceStatus = (studentRegNo, date) => {
    //console.log('Attendance Data ', attendanceData);
    // const parsedDate = parseDateString(attendanceData[0].date); // Parse the date before using it in the condition
    const entry = attendanceData.find(
      entry =>
        entry.registrationNo === studentRegNo &&
        parseDateString(entry.date) === date.getDate()
    );
    return entry ? 'Present' : 'Absent';
  };
  
  useEffect(() => {
    fetchRegistrationNos();
  }, []); // Fetch registration numbers when the component mounts

  const renderAttendanceTable = () => {
    console.log('registrationNoOptions:', registrationNoOptions); 
    const daysInMonth = new Date(year, month, 0).getDate(); // Calculate the correct number of days
    const rows = [];
     // Find matching student
     const matchingStudents = registrationNoOptions.filter(option => option.RegNo === parseInt(registrationNo));
     console.log('matching student', matchingStudents);
     const studentName = matchingStudents.length > 0 ? `${matchingStudents[0].FirstName} ${matchingStudents[0].LastName}` : '';
     console.log('StudentName', studentName);

  if(!selectedDate){
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const formattedDate = currentDate.toLocaleDateString('en-GB'); // Format: dd-mm-yy
  console.log('selected date and formated date', selectedDate,formattedDate);
      // Check if the selectedDate is set and matches the currentDate
        const attendanceStatus = renderAttendanceStatus(registrationNo, currentDate);
        const cellClass = attendanceStatus === 'Present' ? 'present-cell' : 'absent-cell';


      rows.push(
        <tr key={currentDate.toISOString()}>
          <td>{registrationNo}</td>
          <td>{studentName}</td>
          <td>{subject}</td>
          <td>{formattedDate}</td>
          <td  id={cellClass} >{attendanceStatus}</td>
        </tr>
      );

    }
  } else {
    attendanceData.forEach(entry => {
      const entryDate = new Date(entry.date); // Use the actual date string from the entry
      //const selectedDateObject = new Date(selectedDate); // Convert selectedDate to a Date object
        const attendanceStatus = entry?'Present':'Absent';
        const cellClass = attendanceStatus === 'Present' ? 'present-cell' : 'absent-cell';
        rows.push(
          <tr key={entry.date}>
            <td>{entry.registrationNo}</td>
            <td>{studentName}</td>
            <td>{entry.subject}</td>
            <td>{entry.date}</td>
            <td id={cellClass}>{attendanceStatus}</td>
          </tr>
        );
    });
  }
  return rows;
    
  };

  return (
    <div className="container">
      <h2 className="mt-4">Attendance Tracker</h2>
      <div className="row mt-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
          >
            <option value="">Select Registration No</option>
            {registrationNoOptions.map((option) => (
              <option key={option.RegNo} value={option.RegNo}>
                {option.RegNo} - {option.FirstName} {option.LastName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            <option value="dotnet">DotNet</option>
            <option value="operating-system">Operating System</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="col-md-2">
         <input
           type="date"
           className="form-control"
           placeholder="Date"
           value={selectedDate}
           onChange={(e) => setSelectedDate(e.target.value)}
           />
          </div>
        <div className="col-md-2">
          <button
            className="btn btn-primary"
            onClick={fetchAttendance}
            disabled={isFetchingAttendance}
          >
            Fetch Attendance
          </button>
        </div>
      </div>
      {isFetchButtonClicked && (
      <div className="mt-4">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Registration No</th>
              <th>Name</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>{renderAttendanceTable()}</tbody>
        </table>
      </div>
    )}
  </div>

  );
}

export default AttendanceTracker;