/**
 * Create Admin User Script
 * Creates an admin user in Firebase Authentication and sets custom claims
 * Usage: node createAdmin.js <email> <password> <name>
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses credentials from VPS or environment)
try {
  const serviceAccount = require('../config/firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  // Try using default credentials from environment
  console.log('Warning: Could not load service account file, trying default credentials');
  admin.initializeApp();
}

async function createAdminUser() {
  try {
    console.log('\n🔐 Digital Coffee - Create Admin User\n');

    // Get credentials from command line arguments
    const email = process.argv[2] || 'admin@digitalcoffee.cafe';
    const password = process.argv[3] || 'admin123456';
    const name = process.argv[4] || 'Admin User';

    console.log(`Creating admin user: ${email}`);
    console.log('\n⏳ Creating admin user...\n');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email.trim(),
      password: password,
      displayName: name.trim(),
      emailVerified: true
    });

    console.log(`✅ User created with UID: ${userRecord.uid}`);

    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });

    console.log('✅ Admin privileges granted');

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email: email.trim(),
      name: name.trim(),
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

    console.log('\n✨ Admin user created successfully!\n');
    console.log('You can now log in at: https://digitalcoffee.cafe/admin/login');
    console.log(`Email: ${email.trim()}`);
    console.log(`Password: ${password}\n`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  } finally {
    process.exit(0);
  }
}

createAdminUser();
