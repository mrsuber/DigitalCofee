// Test Firebase Authentication Login
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBB15VnEWlGlkLPjgqaS4ofM__SB12x9_k',
  authDomain: 'digital-coffee-app.firebaseapp.com',
  projectId: 'digital-coffee-app',
  storageBucket: 'digital-coffee-app.firebasestorage.app',
  messagingSenderId: '555163422647',
  appId: '1:555163422647:web:c884a18767f57f1ec1e232',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testLogin() {
  try {
    console.log('Testing login with Firebase...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'admin@digitalcoffee.cafe',
      'DigitalCoffee2024!'
    );
    console.log('✓ Login successful!');
    console.log('User ID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    const token = await userCredential.user.getIdToken();
    console.log('Token obtained:', token.substring(0, 50) + '...');
    process.exit(0);
  } catch (error) {
    console.error('✗ Login failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    process.exit(1);
  }
}

testLogin();
