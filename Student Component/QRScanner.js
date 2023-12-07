import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({RegNo}) {
  const [dataSaved, setDataSaved] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const studentRegistrationNo=RegNo; 
  let scanner = null;

  useEffect(() => {
    if (!scanner && scanning) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 20,
      });
      console.log('RegNobeforeSuccess', studentRegistrationNo);
      const success = async (result) => {
        setScanning(false);
        console.log('Scanned result:', result);

        if (!dataSaved) {
          console.log('Data not saved yet, proceeding to save.');
            const registrationNo = result.split(" ")[2];
            const subject = result.split(" ")[4];
            const date = result.split(" ")[6];
            console.log('Data extracted:', registrationNo, subject, date);
            console.log('RegNo', studentRegistrationNo);
          if(studentRegistrationNo===registrationNo){
            try {
              const response = await fetch('https://10.104.127.74:5000/api/save-scanned-data', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  registrationNo,
                  subject,
                  date,
                }),
              });

              if (response.ok) {
                setDataSaved(true);
                setErrorState(null);
              } else if (response.status === 409) {
                setErrorState('Attendance already marked.');
              } else {
                setErrorState('Failed to save scanned data. Please try again.');
              }
            } catch (error) {
              console.error('Error saving scanned data:', error);
              setErrorState('An error occurred while saving data. Please try again.');
            }
          }else{
            setErrorState('You are not authorized to mark attendance for this student');
          }
        }
      };

      const errorCallback = (err) => {
        console.error(err);
        setErrorState('An error occurred during scanning. Please try again.');
      };

      scanner.render(success, errorCallback);
    }

    return () => {
      if (scanner) {
        scanner.clear();
        scanner = null;
      }
    };
  }, [scanning, dataSaved]);

  return (
    <div className="card p-4">
      <h2>Scan QR Code to Mark Attendance</h2>
      <div id="reader" style={{ display: 'block' }}></div>
      <div id="result">
        {dataSaved && (
          <div>
            <h2>Success!</h2>
            <p>Your attendance has been marked successfully.</p>
          </div>
        )}
        {errorState && <p>{errorState}</p>}
      </div>
    </div>
  );
}

export default QRScanner;
