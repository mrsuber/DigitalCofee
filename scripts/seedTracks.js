/**
 * Seed Firestore with binaural beats audio tracks
 * Run with: node scripts/seedTracks.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const alphaTracks = [
  {
    name: 'Morning Creative Flow',
    description: 'Start your day with enhanced creativity and relaxed focus. Perfect for brainstorming and artistic work.',
    duration: 600, // 10 minutes in seconds
    waveType: 'alpha',
    frequency: '10 Hz',
    file: '/audio/alpha/morning-creative-flow.mp3',
    category: 'creativity',
    tags: ['morning', 'creativity', 'focus', 'relaxation'],
    isPremium: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Deep Meditation Journey',
    description: 'Achieve deep relaxation and inner peace with calming alpha waves. Ideal for meditation and stress relief.',
    duration: 1200, // 20 minutes
    waveType: 'alpha',
    frequency: '8 Hz',
    file: '/audio/alpha/deep-meditation.mp3',
    category: 'meditation',
    tags: ['meditation', 'relaxation', 'stress-relief', 'calm'],
    isPremium: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Creative Breakthrough',
    description: 'Unlock your creative potential with carefully crafted alpha frequencies. Great for writers, artists, and innovators.',
    duration: 900, // 15 minutes
    waveType: 'alpha',
    frequency: '10 Hz',
    file: '/audio/alpha/creative-breakthrough.mp3',
    category: 'creativity',
    tags: ['creativity', 'innovation', 'inspiration', 'flow'],
    isPremium: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Relaxed Focus Session',
    description: 'Balance alertness and relaxation for optimal learning and creative thinking.',
    duration: 1800, // 30 minutes
    waveType: 'alpha',
    frequency: '9 Hz',
    file: '/audio/alpha/relaxed-focus.mp3',
    category: 'focus',
    tags: ['focus', 'learning', 'study', 'relaxation'],
    isPremium: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const betaTracks = [
  {
    name: 'Peak Performance Mode',
    description: 'Activate your mind for maximum productivity and sharp focus. Perfect for intense work sessions.',
    duration: 600, // 10 minutes
    waveType: 'beta',
    frequency: '20 Hz',
    file: '/audio/beta/peak-performance.mp3',
    category: 'productivity',
    tags: ['productivity', 'focus', 'energy', 'performance'],
    isPremium: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Study Power Hour',
    description: 'Enhanced concentration and memory retention for effective studying and learning.',
    duration: 3600, // 60 minutes
    waveType: 'beta',
    frequency: '15 Hz',
    file: '/audio/beta/study-power.mp3',
    category: 'study',
    tags: ['study', 'learning', 'concentration', 'memory'],
    isPremium: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'Laser Focus',
    description: 'Eliminate distractions and achieve tunnel vision on your most important tasks.',
    duration: 1200, // 20 minutes
    waveType: 'beta',
    frequency: '18 Hz',
    file: '/audio/beta/laser-focus.mp3',
    category: 'focus',
    tags: ['focus', 'concentration', 'productivity', 'deep-work'],
    isPremium: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    name: 'High Energy Boost',
    description: 'Combat afternoon slumps with energizing beta waves. Better than coffee!',
    duration: 900, // 15 minutes
    waveType: 'beta',
    frequency: '25 Hz',
    file: '/audio/beta/energy-boost.mp3',
    category: 'energy',
    tags: ['energy', 'alertness', 'motivation', 'productivity'],
    isPremium: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedTracks() {
  try {
    console.log('🌱 Starting to seed audio tracks...\n');

    // Clear existing tracks (optional - comment out if you want to keep existing tracks)
    console.log('🗑️  Clearing existing tracks...');
    const existingTracks = await db.collection('audioTracks').get();
    const deletePromises = existingTracks.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${existingTracks.size} existing tracks\n`);

    // Add alpha tracks
    console.log('🌊 Adding Alpha Wave tracks...');
    for (const track of alphaTracks) {
      const docRef = await db.collection('audioTracks').add(track);
      console.log(`  ✓ Added: ${track.name} (${track.duration}s) - ID: ${docRef.id}`);
    }

    // Add beta tracks
    console.log('\n⚡ Adding Beta Wave tracks...');
    for (const track of betaTracks) {
      const docRef = await db.collection('audioTracks').add(track);
      console.log(`  ✓ Added: ${track.name} (${track.duration}s) - ID: ${docRef.id}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Total tracks added: ${alphaTracks.length + betaTracks.length}`);
    console.log(`   - Alpha tracks: ${alphaTracks.length}`);
    console.log(`   - Beta tracks: ${betaTracks.length}`);
    console.log('\n⚠️  Note: Audio files need to be added to the /audio directory');
    console.log('   - Alpha waves: /audio/alpha/');
    console.log('   - Beta waves: /audio/beta/\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedTracks();
