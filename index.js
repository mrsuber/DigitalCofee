const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
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

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // Check if user has admin claim
        if (!decodedToken.admin) {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

// Configure multer for audio file uploads
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const waveType = req.body.waveType || 'alpha';
        const uploadPath = path.join(__dirname, 'public', 'audio', waveType);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const audioUpload = multer({
    storage: audioStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /mp3|wav|ogg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files (MP3, WAV, OGG) are allowed!'));
        }
    }
});

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

        // Update streak if session was completed
        if (completed) {
            const streakData = await calculateStreak(req.user.uid);
            await userRef.update({
                'stats.currentStreak': streakData.currentStreak,
                'stats.longestStreak': streakData.longestStreak,
                'stats.lastSessionDate': admin.firestore.FieldValue.serverTimestamp()
            });
        }

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

// Streak calculation helper function
const calculateStreak = async (userId) => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        const userData = userDoc.data();

        // Get all sessions ordered by date
        const sessionsSnapshot = await db.collection('sessions')
            .where('userId', '==', userId)
            .where('completed', '==', true)
            .orderBy('startTime', 'desc')
            .get();

        if (sessionsSnapshot.empty) {
            return { currentStreak: 0, longestStreak: 0 };
        }

        // Create a Set of dates where user completed at least one session
        const sessionDates = new Set();
        sessionsSnapshot.forEach(doc => {
            const sessionData = doc.data();
            if (sessionData.startTime) {
                const date = sessionData.startTime.toDate();
                const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                sessionDates.add(dateString);
            }
        });

        // Sort dates
        const sortedDates = Array.from(sessionDates).sort().reverse();

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if user has a session today or yesterday (to maintain streak)
        const todayString = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        let startDate;
        if (sortedDates[0] === todayString) {
            startDate = today;
            currentStreak = 1;
        } else if (sortedDates[0] === yesterdayString) {
            startDate = yesterday;
            currentStreak = 1;
        } else {
            // Streak is broken
            return {
                currentStreak: 0,
                longestStreak: userData.stats?.longestStreak || 0
            };
        }

        // Count consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(startDate);
            prevDate.setDate(prevDate.getDate() - i);
            const prevDateString = prevDate.toISOString().split('T')[0];

            if (sortedDates[i] === prevDateString) {
                currentStreak++;
            } else {
                break; // Streak broken
            }
        }

        // Calculate longest streak
        let longestStreak = currentStreak;
        let tempStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const prevDate = new Date(sortedDates[i - 1]);
            const diffDays = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        // Use existing longestStreak if it's higher
        longestStreak = Math.max(longestStreak, userData.stats?.longestStreak || 0);

        return { currentStreak, longestStreak };
    } catch (error) {
        console.error('Streak calculation error:', error);
        return { currentStreak: 0, longestStreak: 0 };
    }
};

// Update streak when session ends
app.post('/api/sessions/:sessionId/update-streak', authenticateUser, async (req, res) => {
    try {
        const streakData = await calculateStreak(req.user.uid);

        // Update user's streak data
        await db.collection('users').doc(req.user.uid).update({
            'stats.currentStreak': streakData.currentStreak,
            'stats.longestStreak': streakData.longestStreak,
            'stats.lastSessionDate': admin.firestore.FieldValue.serverTimestamp()
        });

        res.json(streakData);
    } catch (error) {
        console.error('Update streak error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current streak
app.get('/api/streaks/current', authenticateUser, async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const streakData = await calculateStreak(req.user.uid);

        // Update if calculated streak is different from stored
        if (streakData.currentStreak !== userData.stats?.currentStreak) {
            await userRef.update({
                'stats.currentStreak': streakData.currentStreak,
                'stats.longestStreak': streakData.longestStreak
            });
        }

        res.json({
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            lastSessionDate: userData.stats?.lastSessionDate || null
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get streak history (calendar data)
app.get('/api/streaks/history', authenticateUser, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = db.collection('sessions')
            .where('userId', '==', req.user.uid)
            .where('completed', '==', true);

        if (startDate) {
            query = query.where('startTime', '>=', new Date(startDate));
        }
        if (endDate) {
            query = query.where('startTime', '<=', new Date(endDate));
        }

        const sessionsSnapshot = await query.orderBy('startTime', 'desc').get();

        // Group sessions by date
        const sessionsByDate = {};
        sessionsSnapshot.forEach(doc => {
            const sessionData = doc.data();
            if (sessionData.startTime) {
                const date = sessionData.startTime.toDate();
                const dateString = date.toISOString().split('T')[0];

                if (!sessionsByDate[dateString]) {
                    sessionsByDate[dateString] = {
                        date: dateString,
                        sessionCount: 0,
                        totalMinutes: 0,
                        waveTypes: []
                    };
                }

                sessionsByDate[dateString].sessionCount++;
                sessionsByDate[dateString].totalMinutes += Math.round(sessionData.duration / 60);
                sessionsByDate[dateString].waveTypes.push(sessionData.waveType);
            }
        });

        const history = Object.values(sessionsByDate).sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        res.json({ history });
    } catch (error) {
        console.error('Get streak history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Audio tracks API endpoint
app.get('/api/audio/tracks', async (req, res) => {
    try {
        const tracksSnapshot = await db.collection('audioTracks').get();

        const alpha = [];
        const beta = [];

        tracksSnapshot.forEach(doc => {
            const track = { id: doc.id, ...doc.data() };
            if (track.waveType === 'alpha') {
                alpha.push(track);
            } else if (track.waveType === 'beta') {
                beta.push(track);
            }
        });

        // If no tracks in Firestore, return default tracks
        if (alpha.length === 0 && beta.length === 0) {
            return res.json({
                alpha: [
                    { id: 'alpha-1', name: 'Morning Creative Flow', duration: 600, waveType: 'alpha', file: '/audio/alpha/morning-flow.mp3' },
                    { id: 'alpha-2', name: 'Relaxed Ideation', duration: 900, waveType: 'alpha', file: '/audio/alpha/relaxed-ideation.mp3' }
                ],
                beta: [
                    { id: 'beta-1', name: 'Afternoon Focus Boost', duration: 1200, waveType: 'beta', file: '/audio/beta/focus-boost.mp3' },
                    { id: 'beta-2', name: 'Active Thinking', duration: 600, waveType: 'beta', file: '/audio/beta/active-thinking.mp3' }
                ]
            });
        }

        res.json({ alpha, beta });
    } catch (error) {
        console.error('Failed to fetch tracks:', error);
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

// Admin: Upload audio track
app.post('/api/admin/audio/upload', authenticateAdmin, audioUpload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const { name, waveType, duration } = req.body;

        if (!name || !waveType || !duration) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Missing required fields: name, waveType, duration' });
        }

        if (waveType !== 'alpha' && waveType !== 'beta') {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'waveType must be either "alpha" or "beta"' });
        }

        // Create relative file path for storing in database
        const relativePath = `/audio/${waveType}/${req.file.filename}`;

        // Save track info to Firestore
        const trackData = {
            name,
            waveType,
            duration: parseInt(duration),
            file: relativePath,
            uploadedBy: req.user.email,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            fileSize: req.file.size,
            filename: req.file.filename
        };

        const trackRef = await db.collection('audioTracks').add(trackData);

        res.json({
            message: 'Audio track uploaded successfully',
            trackId: trackRef.id,
            track: {
                id: trackRef.id,
                ...trackData,
                uploadedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Audio upload error:', error);

        // Delete uploaded file if database operation fails
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Failed to delete file after error:', unlinkError);
            }
        }

        res.status(500).json({ error: error.message || 'Failed to upload audio track' });
    }
});

// Admin: Delete audio track
app.delete('/api/admin/audio/:trackId', authenticateAdmin, async (req, res) => {
    try {
        const { trackId } = req.params;

        // Get track info from Firestore
        const trackDoc = await db.collection('audioTracks').doc(trackId).get();

        if (!trackDoc.exists) {
            return res.status(404).json({ error: 'Track not found' });
        }

        const trackData = trackDoc.data();

        // Delete the audio file from disk
        if (trackData.filename && trackData.waveType) {
            const filePath = path.join(__dirname, 'public', 'audio', trackData.waveType, trackData.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete from Firestore
        await db.collection('audioTracks').doc(trackId).delete();

        res.json({
            message: 'Audio track deleted successfully',
            trackId
        });
    } catch (error) {
        console.error('Audio delete error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete audio track' });
    }
});

// Admin: Get all users
app.get('/api/users', authenticateAdmin, async (req, res) => {
    try {
        const listUsersResult = await admin.auth().listUsers(1000);

        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            createdAt: userRecord.metadata.creationTime,
            lastLoginAt: userRecord.metadata.lastSignInTime,
            disabled: userRecord.disabled,
            customClaims: userRecord.customClaims
        }));

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
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

// ============================
// ADMIN ENDPOINTS
// ============================

// Get all users with full details (stats, subscription)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const { tier, search, limit = 50, offset = 0 } = req.query;

        // Get all Firebase Auth users
        const listUsersResult = await admin.auth().listUsers(1000);
        const firebaseUsers = listUsersResult.users;

        // Get all Firestore user documents
        const usersSnapshot = await db.collection('users').get();
        const firestoreUsersMap = {};
        usersSnapshot.forEach(doc => {
            firestoreUsersMap[doc.id] = doc.data();
        });

        // Combine Firebase Auth + Firestore data
        let users = firebaseUsers.map(user => {
            const firestoreData = firestoreUsersMap[user.uid] || {};
            return {
                userId: user.uid,
                email: user.email,
                name: user.displayName || firestoreData.name || 'Unknown',
                emailVerified: user.emailVerified,
                disabled: user.disabled,
                createdAt: user.metadata.creationTime,
                lastLogin: user.metadata.lastSignInTime,
                // Firestore data
                stats: firestoreData.stats || {
                    totalSessions: 0,
                    totalMinutes: 0,
                    alphaSessions: 0,
                    betaSessions: 0,
                    currentStreak: 0,
                    longestStreak: 0
                },
                subscription: firestoreData.subscription || {
                    tier: 'free',
                    status: 'active'
                },
                isAdmin: firestoreData.isAdmin || false
            };
        });

        // Filter by tier if specified
        if (tier && tier !== 'all') {
            users = users.filter(user => user.subscription.tier === tier);
        }

        // Filter by search if specified
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        // Sort by last login (most recent first)
        users.sort((a, b) => {
            const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
            const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
            return bTime - aTime;
        });

        // Apply pagination
        const total = users.length;
        const paginatedUsers = users.slice(Number(offset), Number(offset) + Number(limit));

        res.json({
            users: paginatedUsers,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: Number(offset) + Number(limit) < total
            }
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get specific user details
app.get('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get Firebase Auth user
        const authUser = await admin.auth().getUser(userId);

        // Get Firestore user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Get user's sessions
        const sessionsSnapshot = await db.collection('sessions')
            .where('userId', '==', userId)
            .orderBy('startTime', 'desc')
            .limit(10)
            .get();

        const sessions = [];
        sessionsSnapshot.forEach(doc => {
            const sessionData = doc.data();
            sessions.push({
                id: doc.id,
                ...sessionData,
                startTime: sessionData.startTime ? sessionData.startTime.toDate().toISOString() : null,
                endTime: sessionData.endTime ? sessionData.endTime.toDate().toISOString() : null
            });
        });

        res.json({
            userId: authUser.uid,
            email: authUser.email,
            name: authUser.displayName || userData.name || 'Unknown',
            emailVerified: authUser.emailVerified,
            disabled: authUser.disabled,
            createdAt: authUser.metadata.creationTime,
            lastLogin: authUser.metadata.lastSignInTime,
            stats: userData.stats || {
                totalSessions: 0,
                totalMinutes: 0,
                alphaSessions: 0,
                betaSessions: 0,
                currentStreak: 0,
                longestStreak: 0
            },
            subscription: userData.subscription || {
                tier: 'free',
                status: 'active'
            },
            isAdmin: userData.isAdmin || false,
            recentSessions: sessions
        });
    } catch (error) {
        console.error('Admin get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// Grant premium access to user
app.post('/api/admin/users/:userId/grant-premium', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { tier = 'premium', duration = 'yearly' } = req.body;

        if (!['premium', 'elite', 'lifetime'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier. Must be premium, elite, or lifetime' });
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create user doc if doesn't exist
            await userRef.set({
                subscription: {
                    tier,
                    status: 'active',
                    grantedBy: req.user.email,
                    grantedAt: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt: tier === 'lifetime' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                },
                stats: {
                    totalSessions: 0,
                    totalMinutes: 0,
                    alphaSessions: 0,
                    betaSessions: 0,
                    currentStreak: 0,
                    longestStreak: 0
                }
            });
        } else {
            await userRef.update({
                'subscription.tier': tier,
                'subscription.status': 'active',
                'subscription.grantedBy': req.user.email,
                'subscription.grantedAt': admin.firestore.FieldValue.serverTimestamp(),
                'subscription.expiresAt': tier === 'lifetime' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            });
        }

        res.json({
            message: `${tier} access granted successfully`,
            userId,
            tier,
            grantedBy: req.user.email
        });
    } catch (error) {
        console.error('Grant premium error:', error);
        res.status(500).json({ error: 'Failed to grant premium access' });
    }
});

// Ban/disable user
app.post('/api/admin/users/:userId/ban', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Disable user in Firebase Auth
        await admin.auth().updateUser(userId, {
            disabled: true
        });

        // Update Firestore
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            disabled: true,
            bannedBy: req.user.email,
            bannedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            message: 'User banned successfully',
            userId
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

// Unban user
app.post('/api/admin/users/:userId/unban', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Enable user in Firebase Auth
        await admin.auth().updateUser(userId, {
            disabled: false
        });

        // Update Firestore
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            disabled: false,
            unbannedBy: req.user.email,
            unbannedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            message: 'User unbanned successfully',
            userId
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ error: 'Failed to unban user' });
    }
});

// Delete user
app.delete('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete all user's sessions
        const sessionsSnapshot = await db.collection('sessions')
            .where('userId', '==', userId)
            .get();

        const batch = db.batch();
        sessionsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Delete Firestore user document
        await db.collection('users').doc(userId).delete();

        // Delete Firebase Auth user
        await admin.auth().deleteUser(userId);

        res.json({
            message: 'User deleted successfully',
            userId,
            sessionsDeleted: sessionsSnapshot.size
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get admin dashboard stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        // Count users
        const listUsersResult = await admin.auth().listUsers(1000);
        const totalUsers = listUsersResult.users.length;

        // Count sessions
        const sessionsSnapshot = await db.collection('sessions').get();
        const totalSessions = sessionsSnapshot.size;

        // Calculate total minutes
        let totalMinutes = 0;
        sessionsSnapshot.forEach(doc => {
            const data = doc.data();
            totalMinutes += data.duration || 0;
        });

        // Count premium users
        const usersSnapshot = await db.collection('users').get();
        let premiumUsers = 0;
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.subscription && data.subscription.tier !== 'free') {
                premiumUsers++;
            }
        });

        // Count active users (logged in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeUsers = listUsersResult.users.filter(user => {
            if (!user.metadata.lastSignInTime) return false;
            return new Date(user.metadata.lastSignInTime) > thirtyDaysAgo;
        }).length;

        // Count audio tracks
        const tracksSnapshot = await db.collection('audioTracks').get();
        const totalAudioFiles = tracksSnapshot.size;

        res.json({
            totalUsers,
            activeUsers,
            premiumUsers,
            freeUsers: totalUsers - premiumUsers,
            totalSessions,
            totalMinutes,
            totalAudioFiles,
            averageSessionsPerUser: totalUsers > 0 ? (totalSessions / totalUsers).toFixed(1) : 0,
            averageMinutesPerSession: totalSessions > 0 ? (totalMinutes / totalSessions).toFixed(1) : 0
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('Digital Coffee server running on port ' + PORT);
    console.log('Audio files will be served from /audio directory');
    console.log('CDN-ready with proper caching headers');
    console.log('Firebase integrated and ready');
});
