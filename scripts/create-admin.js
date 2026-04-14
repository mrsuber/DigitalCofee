const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n=== Digital Coffee Admin User Creation ===\n');

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 characters): ');
    const displayName = await question('Enter admin display name: ');

    if (!email || !password || password.length < 6) {
      console.error('Error: Email and password (min 6 chars) are required');
      process.exit(1);
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || 'Admin User',
      emailVerified: true
    });

    // Set custom claim for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    console.log('\n✅ Admin user created successfully!');
    console.log('User ID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('Display Name:', userRecord.displayName);
    console.log('\nYou can now login with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
