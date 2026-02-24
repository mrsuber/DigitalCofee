const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'digital-coffee-app'
});

// Get Firestore database reference
const db = admin.firestore();

// Get Firebase Auth reference
const auth = admin.auth();

// Get Firebase Messaging reference
const messaging = admin.messaging();

module.exports = {
  admin,
  db,
  auth,
  messaging
};
