const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // เช็กว่ามีอีเมลนี้ใน Firestore หรือยัง
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // เข้ารหัส password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // บันทึกลง Firestore
    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const docRef = await userRef.add(newUser);

    // สร้าง JWT Token — key ต้องชื่อ "userId" ให้ตรงกับที่ middleware/auth.js อ่าน (decoded.userId)
    const token = jwt.sign({ userId: docRef.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: docRef.id, name, email }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ userId: userDoc.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: userDoc.id, name: userData.name, email: userData.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

module.exports = router;