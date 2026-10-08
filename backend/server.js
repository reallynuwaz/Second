require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();

// เชื่อมต่อ Firebase
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// เสิร์ฟรูปภาพในโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= Routes Integration =================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
// ======================================================

app.get('/', (req, res) => {
  res.json({ message: 'SECOND API (Firebase) กำลังทำงานอยู่' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server กำลังรันที่ http://localhost:${PORT}`);
});