const jwt = require('jsonwebtoken');

/* ตรวจสอบว่า request มี token ที่ถูกต้องแนบมาไหม (ใช้ป้องกัน route ที่ต้องล็อกอินก่อน เช่น ลงขายสินค้า)
   Frontend ต้องแนบ header แบบนี้มาด้วยทุกครั้ง: Authorization: Bearer <token> */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // แนบ userId ไปให้ route ถัดไปใช้งาน
    next();
  } catch (err) {
    return res.status(401).json({ message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

module.exports = requireAuth;
