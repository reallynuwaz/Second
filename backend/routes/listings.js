const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../config/db');
const requireAuth = require('../middleware/auth');

// หมวดหมู่คงที่ของเว็บ (ตรงกับที่ frontend ใช้ใน js/common.js — ถ้าจะเพิ่ม/ลด ต้องแก้ทั้ง 2 ที่ให้ตรงกัน)
const CATEGORIES = ['ไอที', 'แฟชั่น', 'ของใช้ในบ้าน', 'ยานพาหนะ', 'กีฬา', 'ของสะสม', 'หนังสือ', 'อื่นๆ'];

// ตั้งค่า Multer เก็บรูปภาพในโฟลเดอร์ backend/uploads (ใช้ path.join กัน error เวลารันจากคนละที่)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB ต่อไฟล์

// @route   GET api/listings/categories — รายชื่อหมวดหมู่ทั้งหมด
router.get('/categories', (req, res) => {
  res.json(CATEGORIES);
});

// @route   GET api/listings — ดูสินค้าทั้งหมด กรองด้วย ?category=xxx หรือค้นหาด้วย ?q=xxx ได้
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('listings').orderBy('createdAt', 'desc').get();
    let listings = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    if (req.query.category) {
      listings = listings.filter(l => l.category === req.query.category);
    }
    if (req.query.subcategory) {
      listings = listings.filter(l => l.subcategory === req.query.subcategory);
    }
    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      listings = listings.filter(l => (l.title || '').toLowerCase().includes(q));
    }

    res.json(listings);
  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ message: 'โหลดรายการสินค้าไม่สำเร็จ', error: err.message });
  }
});

// @route   GET api/listings/:id — ดูรายละเอียดสินค้าชิ้นเดียว
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
    res.json({ _id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(404).json({ message: 'ไม่พบสินค้านี้' });
  }
});

// @route   POST api/listings — ลงขายสินค้าใหม่ (ต้องล็อกอินก่อน) แนบรูปได้สูงสุด 5 รูป
router.post('/', requireAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, subcategory, condition } = req.body;
    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    const imageUrls = (req.files || []).map(f => '/uploads/' + f.filename);

    // Firestore ไม่มี populate() แบบ Mongoose เลยเก็บชื่อผู้ขายติดไว้กับตัวประกาศเลย (denormalize)
    // เพื่อให้ตอนดึงรายการสินค้ากลับมา ไม่ต้องไป query ตาราง users ซ้ำทุกครั้ง
    const userDoc = await db.collection('users').doc(req.userId).get();
    const sellerName = userDoc.exists ? userDoc.data().name : 'ไม่ทราบชื่อ';

    const newListing = {
      title,
      description,
      price: Number(price),
      category,
      subcategory: subcategory || null,
      condition: condition || 'สภาพดี',
      images: imageUrls,
      seller: { _id: req.userId, name: sellerName },
      status: 'available',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('listings').add(newListing);
    res.status(201).json({ _id: docRef.id, ...newListing });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ message: 'ลงขายสินค้าไม่สำเร็จ', error: err.message });
  }
});

// @route   PATCH api/listings/:id/sold — มาร์คว่าขายแล้ว (เฉพาะเจ้าของประกาศ)
router.patch('/:id/sold', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('listings').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'ไม่พบสินค้านี้' });

    const data = doc.data();
    if (!data.seller || data.seller._id !== req.userId) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขประกาศนี้' });
    }

    await ref.update({ status: 'sold' });
    res.json({ _id: doc.id, ...data, status: 'sold' });
  } catch (err) {
    console.error('Mark sold error:', err);
    res.status(500).json({ message: 'อัปเดตไม่สำเร็จ', error: err.message });
  }
});

// @route   DELETE api/listings/:id — ลบประกาศ (เฉพาะเจ้าของ)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('listings').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: 'ไม่พบสินค้านี้' });

    const data = doc.data();
    if (!data.seller || data.seller._id !== req.userId) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบประกาศนี้' });
    }

    await ref.delete();
    res.json({ message: 'ลบประกาศเรียบร้อย' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ message: 'ลบไม่สำเร็จ', error: err.message });
  }
});

module.exports = router;
