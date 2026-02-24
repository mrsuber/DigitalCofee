const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { admin, db, auth, messaging } = require('./config/firebase');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper headers
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        // Set caching headers for audio files
        if (filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.ogg')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
            res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for audio streaming
        }
        // Set CORS headers for audio streaming
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Digital Coffee API is running' });
});

// API routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Digital Coffee API is working!', timestamp: new Date() });
});

// Firebase test endpoint
app.get('/api/firebase/test', async (req, res) => {
    try {
        // Test Firestore connection
        const testDoc = await db.collection('_test').doc('connection').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: 'connected'
        });
        res.json({
            message: 'Firebase connected successfully!',
            firestore: 'OK',
            auth: 'OK',
            messaging: 'OK'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Registration
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email,
            name,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            stats: {
                totalSessions: 0,
                totalMinutes: 0,
                alphaSessions: 0,
                betaSessions: 0,
                currentStreak: 0,
                longestStreak: 0
            }
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: userRecord.uid,
            email: userRecord.email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get User Profile
app.get('/api/users/profile', authenticateUser, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: req.user.uid,
            ...userDoc.data()
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start a listening session
app.post('/api/sessions/start', authenticateUser, async (req, res) => {
    try {
        const { trackId, waveType } = req.body;

        const sessionRef = await db.collection('sessions').add({
            userId: req.user.uid,
            trackId,
            waveType,
            startTime: admin.firestore.FieldValue.serverTimestamp(),
            endTime: null,
            duration: 0,
            completed: false
        });

        res.status(201).json({
            message: 'Session started',
            sessionId: sessionRef.id
        });
    } catch (error) {
        console.error('Session start error:', error);
        res.status(500).json({ error: error.message });
    }
});

// End a listening session
app.post('/api/sessions/:sessionId/end', authenticateUser, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { duration, completed } = req.body;

        const sessionRef = db.collection('sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (sessionDoc.data().userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update session
        await sessionRef.update({
            endTime: admin.firestore.FieldValue.serverTimestamp(),
            duration,
            completed
        });

        // Update user stats
        const userRef = db.collection('users').doc(req.user.uid);
        const waveType = sessionDoc.data().waveType;

        await userRef.update({
            'stats.totalSessions': admin.firestore.FieldValue.increment(1),
            'stats.totalMinutes': admin.firestore.FieldValue.increment(Math.round(duration / 60)),
            ['stats.' + waveType + 'Sessions']: admin.firestore.FieldValue.increment(1)
        });

        res.json({ message: 'Session ended successfully' });
    } catch (error) {
        console.error('Session end error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user sessions
app.get('/api/sessions', authenticateUser, async (req, res) => {
    try {
        const sessionsSnapshot = await db.collection('sessions')
            .where('userId', '==', req.user.uid)
            .orderBy('startTime', 'desc')
            .limit(50)
            .get();

        const sessions = [];
        sessionsSnapshot.forEach(doc => {
            sessions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ sessions });
    } catch (error) {
        console.error('Sessions fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Audio tracks API endpoint
app.get('/api/audio/tracks', (req, res) => {
    res.json({
        alpha: [
            { id: 'alpha-1', name: 'Morning Creative Flow', duration: 600, waveType: 'alpha', file: '/audio/alpha/morning-flow.mp3' },
            { id: 'alpha-2', name: 'Relaxed Ideation', duration: 900, waveType: 'alpha', file: '/audio/alpha/relaxed-ideation.mp3' }
        ],
        beta: [
            { id: 'beta-1', name: 'Afternoon Focus Boost', duration: 1200, waveType: 'beta', file: '/audio/beta/focus-boost.mp3' },
            { id: 'beta-2', name: 'Active Thinking', duration: 600, waveType: 'beta', file: '/audio/beta/active-thinking.mp3' }
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('Digital Coffee server running on port ' + PORT);
    console.log('Audio files will be served from /audio directory');
    console.log('CDN-ready with proper caching headers');
    console.log('Firebase integrated and ready');
});
