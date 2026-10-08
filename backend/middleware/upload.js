const multer = require('multer');
const path = require('path');

// เก็บไฟล์รูปไว้ในโฟลเดอร์ uploads/ ตั้งชื่อไฟล์ใหม่กันชนกัน
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, gif)'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB ต่อไฟล์
});

module.exports = upload;
