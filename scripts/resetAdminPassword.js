/**
 * Reset Admin Password Script
 * Resets the password for an existing Firebase user
 * Usage: node resetAdminPassword.js <email> <newPassword>
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

async function resetPassword() {
  try {
    console.log('\n🔐 Digital Coffee - Reset Admin Password\n');

    const email = process.argv[2] || 'admin@digitalcoffee.cafe';
    const newPassword = process.argv[3] || 'admin123456';

    console.log(`Resetting password for: ${email}`);

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user with UID: ${userRecord.uid}`);

    // Update password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });
    console.log('✅ Password updated successfully');

    console.log('\n✨ Password reset complete!\n');
    console.log('You can now log in at: https://digitalcoffee.cafe/admin/login');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}\n`);

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  } finally {
    process.exit(0);
  }
}

resetPassword();
