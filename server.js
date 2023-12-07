require('dotenv').config();

const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const qr = require('qr-image');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());


const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_FILE),
  cert: fs.readFileSync(process.env.SSL_CRT_FILE)
};

const server = https.createServer(sslOptions, app);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dell123',
  database: 'college'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

server.listen(5000, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});


app.get('/student-attendance/:registrationNo', (req, res) => {
  const studentRegistrationNo = req.params.registrationNo;
  const { date, month, subject } = req.query; // Use req.query to access query parameters
  console.log('date:', date ,'month:',month, 'subject',subject);
  let query = `SELECT * FROM scanned_qr WHERE registrationNo = ?`;
  const queryParams = [studentRegistrationNo];

  if (date) {
    query += ` AND DATE(ScannedTime) = ?`
    queryParams.push(date);
  }

  if (month) {
    query += ` AND YEAR(ScannedTime) = ? AND MONTH(ScannedTime) = ?`;
    
    const [year, monthValue] = month.split('-');
    queryParams.push(year, monthValue);
  }

  if (subject) {
    query += ` AND subject = ?`;
    queryParams.push(subject);
  }

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error fetching student attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      //console.log('studentAtenndanceQuery',query);
      res.json(results);
    }
  });
});

app.get('/api/scanned-qr',(req, res)=>{
  const query = 'SELECT * FROM scanned_qr';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/getRegistrationNosWithNames',(req,res)=>{
  const query = 'SELECT * FROM students';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // console.log(results);
      res.status(200).json(results);
    }
  });
});

// API to fetch attendance records based on filters
app.post('/api/getAttendance', (req, res) => {
  const { registrationNo, subject, year, month, date } = req.body;

  let query = `SELECT * FROM scanned_qr WHERE 1`;

  if (registrationNo) {
    query += ` AND registrationNo = '${registrationNo}'`;
  }
  if (subject) {
    query += ` AND subject = '${subject}'`;
  }
  if (year) {
    query += ` AND YEAR(ScannedTime) = ${year}`;
  }
  if (month) {
    query += ` AND MONTH(ScannedTime) = ${month}`;
  }
  if (date) {
    query += ` AND DATE(ScannedTime) = ?`; // Use parameter placeholder
  }

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      res.status(500).json({ error: 'Error fetching attendance' });
      return;
    }
    console.log('Attendance query:', query); // Add this line
    console.log(results);
    res.json(results);
  });
});


app.post('/api/student/login', (req, res) => {
  const { registrationNo, password } = req.body;

  const selectQuery = 'SELECT * FROM students WHERE RegNo = ?';
  db.query(selectQuery, [registrationNo], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (results.length === 0 || password !== results[0].Password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Store user's session data
    // Generate and sign a JWT token
    const token = jwt.sign({ registrationNo }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token as response
    res.json({ message: 'Logged in successfully', token });
  });
});
// Authentication for teacher login
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;

  const selectQuery = 'SELECT * FROM teachers WHERE username = ?';
  db.query(selectQuery, [username], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (results.length === 0 || password !== results[0].password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate and sign a JWT token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token as response
    res.json({ message: 'Logged in successfully', token });
  });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.username = decoded.username;
    next();
  });
}

// Route to check session validity
app.get('/api/check-session', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Session active' });
});


app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM student';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});
app.post('/api/save-scanned-data', (req, res) => {
  const { registrationNo, subject, date } = req.body;

  // Check if the same data already exists in the database
  const checkQuery = `
    SELECT * FROM scanned_qr
    WHERE registrationNo = ? AND subject = ? AND date = ?
  `;

  db.query(checkQuery, [registrationNo, subject, date], (err, results) => {
    if (err) {
      console.error('Error checking data:', err);
      res.status(500).json({ error: 'An error occurred while checking data' });
      return;
    }

    if (results.length > 0) {
      res.status(409).json({ message: 'Data already exists' });
      return;
    } else {
      // Data doesn't exist, proceed to insert
      const insertQuery = `
        INSERT INTO scanned_qr (registrationNo, subject, date)
        VALUES (?, ?, ?)
      `;
    
      db.query(insertQuery, [registrationNo, subject, date], (err, result) => {
        if (err) {
          console.error('Error inserting data:', err);
          res.status(500).json({ error: 'An error occurred while saving data' });
          return;
        }
        console.log('Data inserted into MySQL table');
        res.json({ message: 'Data saved successfully' });
      });
    }
  });
});

// Add this endpoint to your existing server code
app.post('/api/addStudent', (req, res) => {
  const { name, course, dob, address, mobileNo } = req.body;

  // Insert the employee data into the database
  const insertQuery = 'INSERT INTO student (name, course, dob, address ,mobileNo) VALUES (?, ?, ?, ?, ?)';
  db.query(insertQuery, [name, course, dob, address,mobileNo], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Employee data added successfully' });
    }
  });
});


app.post('/api/generate-qr/:regno', (req, res) => {
  const regno = req.params.regno;
  const qrCodeData = req.body.qrCodeData;

  const qrCode = qr.image(qrCodeData, { type: 'png' });

  const imageBuffer = [];
  qrCode.on('data', chunk => {
    imageBuffer.push(chunk);
  });

  qrCode.on('end', () => {
    const qrCodeImageData = Buffer.concat(imageBuffer).toString('base64');

    const updateQuery = 'UPDATE student SET qr_code = ? WHERE regno = ?';
    db.query(updateQuery, [qrCodeImageData, regno], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const qrCodeDataURL = `data:image/png;base64,${qrCodeImageData}`;
        res.status(200).json({ qrCodeDataURL });
      }
    });
  });
});
