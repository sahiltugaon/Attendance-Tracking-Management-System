import React, { useEffect, useState } from 'react';
import './teacher.css'
function ScannedQRList() {
  const [scannedQRList, setScannedQRList] = useState([]);
  const [sortColumn, setSortColumn] = useState('ScannedTime');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    // Fetch scanned QR codes from the server
    const fetchScannedQRList = async () => {
      try {
        const response = await fetch('https://10.104.127.74:5000/api/scanned-qr');
        if (response.ok) {
          const data = await response.json();
          setScannedQRList(data);
        }
      } catch (error) {
        console.error('Error fetching scanned QR codes:', error);
      }
    };

    fetchScannedQRList();
  }, []);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const formattedData = scannedQRList.map(item => ({
    ...item,
    ScannedTime: new Date(item.ScannedTime).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  }));

  const sortedQRList = formattedData.slice().sort((a, b) => {
    if (sortColumn === 'id') {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      } else {
        const comparison = a[sortColumn].localeCompare(b[sortColumn]);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
  });

  return (
    <div>
      <h2>Scanned QR Codes</h2>
      <table className='table table-striped table-bordered'>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>Id</th>
            <th onClick={() => handleSort('registrationNo')}>Registration No</th>
            <th onClick={() => handleSort('subject')}>Subject</th>
            <th onClick={() => handleSort('date')}>QR Date</th>
            <th onClick={() => handleSort('ScannedTime')}>Scanned Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedQRList.map((qr, index) => (
            <tr key={index}>
            <td>{qr.id}</td>
              <td>{qr.registrationNo}</td>
              <td>{qr.subject}</td>
              <td>{qr.date}</td>
              <td>{qr.ScannedTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScannedQRList;
