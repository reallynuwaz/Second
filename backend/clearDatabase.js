/*
  สคริปต์ล้างข้อมูลใน Firestore ทั้งหมด
  ============================================
  ใช้ครั้งเดียวแล้วลบทิ้งได้ (หรือเก็บไว้เผื่อใช้อีกทีก็ได้)

  วิธีรัน: เปิด terminal ที่โฟลเดอร์ backend แล้วพิมพ์
    node clearDatabase.js

  ⚠️ คำเตือน: ลบแล้วกู้คืนไม่ได้ ข้อมูลหายถาวร ไม่มีถังขยะให้กู้นะครับ
*/

require('dotenv').config();
const { db } = require('./config/db');

// ตั้งค่าตรงนี้ว่าจะล้าง collection ไหนบ้าง (true = ล้าง, false = ข้ามไป ไม่แตะ)
const CLEAR_LISTINGS = true;   // ประกาศขายสินค้าทั้งหมด (สาเหตุที่รูปหาย/พังตอนนี้)
const CLEAR_USERS = false;     // บัญชีผู้ใช้ทั้งหมด — เปลี่ยนเป็น true เอง ถ้าอยากล้างด้วย (ทุกคนต้องสมัครใหม่)

async function clearCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) {
    console.log(`✅ "${name}" ว่างอยู่แล้ว ไม่มีอะไรให้ลบ`);
    return;
  }

  console.log(`🗑️  กำลังลบ ${snapshot.size} เอกสารใน "${name}"...`);

  // ลบทีละชุด (batch) สูงสุด 500 ต่อครั้ง ตามข้อจำกัดของ Firestore
  const docs = snapshot.docs;
  const batchSize = 500;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    docs.slice(i, i + batchSize).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log(`✅ ลบ "${name}" เรียบร้อยแล้ว (${snapshot.size} รายการ)`);
}

async function main() {
  console.log('เริ่มล้างฐานข้อมูล...\n');

  if (CLEAR_LISTINGS) await clearCollection('listings');
  else console.log('⏭️  ข้าม "listings" (CLEAR_LISTINGS = false)');

  if (CLEAR_USERS) await clearCollection('users');
  else console.log('⏭️  ข้าม "users" (CLEAR_USERS = false)');

  console.log('\nเสร็จสิ้นครับ ✨');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ เกิดข้อผิดพลาด:', err.message);
  process.exit(1);
});
