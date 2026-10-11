
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : require('./serviceAccountKey.json');

    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

function connectDB() {
    console.log('Connect Firebase Firestore สำเร็จ');
}

module.exports = { connectDB, db };
