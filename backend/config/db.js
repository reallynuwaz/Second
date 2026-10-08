const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

// ตรวจสอบว่าเคย initialize แล้วหรือยัง
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

function connectDB() {
  console.log('Connect Firebase Firestore สำเร็จ');
}

module.exports = { connectDB, db };