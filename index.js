const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { admin, db, auth, messaging } = require('./config/firebase');
const emailService = require('./services/emailService');

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

// User Registration (Email/Password)
// Note: User must be created in Firebase Auth on client-side first
app.post('/api/users/register', authenticateUser, async (req, res) => {
    try {
        const { email, name } = req.body;
        const userId = req.user.uid;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        // Check if user profile already exists
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
            return res.status(400).json({ error: 'User profile already exists' });
        }

        // Create user document in Firestore
        await db.collection('users').doc(userId).set({
            email,
            name,
            provider: 'email',
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

        console.log('Email registration: Created user profile', userId);

        res.status(201).json({
            message: 'User created successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Social Auth Sync (Google, Apple, etc.)
app.post('/api/users/social-auth', authenticateUser, async (req, res) => {
    try {
        const { email, name, provider } = req.body;
        const userId = req.user.uid;

        // Check if user already exists in Firestore
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
            // User already exists, return their ID
            console.log('Social auth: User already exists', userId);
            return res.json({
                userId: userId,
                message: 'User profile already exists'
            });
        }

        // Create new user document in Firestore
        await db.collection('users').doc(userId).set({
            email: email || req.user.email,
            name: name || req.user.name || req.user.displayName,
            provider: provider || 'google',
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

        console.log('Social auth: Created new user profile', userId);

        res.status(201).json({
            userId: userId,
            message: 'User profile created successfully'
        });
    } catch (error) {
        console.error('Social auth error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile
app.get('/api/users/profile', authenticateUser, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            // Auto-create profile if it doesn't exist
            console.log('Profile not found, creating for user:', req.user.uid);
            const newProfile = {
                email: req.user.email || 'unknown@email.com',
                name: req.user.name || req.user.displayName || req.user.email?.split('@')[0] || 'User',
                provider: req.user.firebase?.sign_in_provider || 'email',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                stats: {
                    totalSessions: 0,
                    totalMinutes: 0,
                    alphaSessions: 0,
                    betaSessions: 0,
                    currentStreak: 0,
                    longestStreak: 0
                }
            };

            await db.collection('users').doc(req.user.uid).set(newProfile);
            console.log('Profile created successfully for:', req.user.uid);

            return res.json({
                userId: req.user.uid,
                ...newProfile
            });
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

// Email test endpoint
app.post('/api/email/test', authenticateUser, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const result = await emailService.sendTestEmail(userEmail);

        if (result.success) {
            res.json({
                message: 'Test email sent successfully',
                messageId: result.messageId,
                sentTo: userEmail
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Email test error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send welcome email endpoint
app.post('/api/email/welcome', authenticateUser, async (req, res) => {
    try {
        const { email, name } = req.body;
        const result = await emailService.sendWelcomeEmail(email || req.user.email, name || req.user.name);

        if (result.success) {
            res.json({
                message: 'Welcome email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Welcome email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('Digital Coffee server running on port ' + PORT);
    console.log('Audio files will be served from /audio directory');
    console.log('CDN-ready with proper caching headers');
    console.log('Firebase integrated and ready');
});
