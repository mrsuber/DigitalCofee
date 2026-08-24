/**
 * Set Admin Claims Script
 * Adds admin privileges to an existing Firebase user
 * Usage: node setAdminClaims.js <email>
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  const serviceAccount = require('../config/firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('Warning: Could not load service account file, trying default credentials');
  admin.initializeApp();
}

async function setAdminClaims() {
  try {
    console.log('\n🔐 Digital Coffee - Set Admin Claims\n');

    const email = process.argv[2] || 'admin@digitalcoffee.cafe';
    console.log(`Setting admin claims for: ${email}`);

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user with UID: ${userRecord.uid}`);

    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    console.log('✅ Admin privileges granted');

    // Update or create user document in Firestore
    const userRef = admin.firestore().collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ User profile updated in Firestore');
    } else {
      await userRef.set({
        userId: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || 'Admin User',
        role: 'admin',
        subscription: {
          tier: 'lifetime',
          status: 'active'
        },
        stats: {
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          alphaSessions: 0,
          betaSessions: 0
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ User profile created in Firestore');
    }

    console.log('\n✨ Admin claims set successfully!\n');
    console.log('You can now log in at: https://digitalcoffee.cafe/admin/login');
    console.log(`Email: ${email}\n`);

    // Force token refresh by revoking current tokens
    await admin.auth().revokeRefreshTokens(userRecord.uid);
    console.log('✅ Tokens revoked - user must log in again to get new admin token\n');

  } catch (error) {
    console.error('❌ Error setting admin claims:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  } finally {
    process.exit(0);
  }
}

setAdminClaims();
