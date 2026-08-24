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

        // Sessions today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = admin.firestore.Timestamp.fromDate(today);

        const sessionsToday = await db.collection('sessions')
            .where('startTime', '>=', todayTimestamp)
            .get();

        // Calculate total listening time and average
        let totalListeningTime = 0;
        sessionsSnapshot.forEach(doc => {
            const data = doc.data();
            totalListeningTime += data.duration || 0;
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

        // Count audio tracks by type
        const tracksSnapshot = await db.collection('audioTracks').get();
        let alphaTracks = 0;
        let betaTracks = 0;
        tracksSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.waveType === 'alpha') alphaTracks++;
            else if (data.waveType === 'beta') betaTracks++;
        });

        res.json({
            totalUsers,
            activeUsers,
            premiumUsers,
            freeUsers: totalUsers - premiumUsers,
            totalSessions,
            sessionsToday: sessionsToday.size,
            totalListeningTime,
            avgSessionTime: totalSessions > 0 ? Math.round(totalListeningTime / totalSessions) : 0,
            totalTracks: tracksSnapshot.size,
            alphaTracks,
            betaTracks
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// ========================================
// FEEDBACK / SUPPORT ENDPOINTS
// ========================================

// Submit feedback (from mobile app)
app.post('/api/feedback/submit', authenticateUser, async (req, res) => {
    try {
        const { subject, message, category, priority } = req.body;
        const userId = req.user.uid;

        // Get user details
        const userRecord = await admin.auth().getUser(userId);

        // Create feedback document
        const feedbackData = {
            userId,
            userEmail: userRecord.email,
            userName: userRecord.displayName || 'Unknown',
            subject: subject || 'No subject',
            message,
            category: category || 'general', // general, bug, feature, help
            priority: priority || 'medium', // low, medium, high
            status: 'pending', // pending, in-progress, resolved, closed
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            responses: []
        };

        const feedbackRef = await db.collection('feedback').add(feedbackData);

        res.json({
            success: true,
            feedbackId: feedbackRef.id,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Get all feedback (admin only)
app.get('/api/admin/feedback', authenticateAdmin, async (req, res) => {
    try {
        const { status, category, limit = 50, offset = 0 } = req.query;

        let query = db.collection('feedback');

        // Apply filters
        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }
        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }

        // Order by creation date (newest first)
        query = query.orderBy('createdAt', 'desc');

        // Get total count
        const allSnapshot = await query.get();
        const total = allSnapshot.size;

        // Apply pagination
        query = query.limit(parseInt(limit)).offset(parseInt(offset));

        const snapshot = await query.get();
        const feedback = [];

        snapshot.forEach(doc => {
            feedback.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate().toISOString()
            });
        });

        res.json({
            feedback,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            }
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// Get specific feedback details (admin only)
app.get('/api/admin/feedback/:feedbackId', authenticateAdmin, async (req, res) => {
    try {
        const { feedbackId } = req.params;

        const doc = await db.collection('feedback').doc(feedbackId).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const data = doc.data();
        res.json({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString()
        });
    } catch (error) {
        console.error('Get feedback details error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback details' });
    }
});

// Update feedback status (admin only)
app.patch('/api/admin/feedback/:feedbackId', authenticateAdmin, async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { status, priority, notes } = req.body;

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (notes) updateData.adminNotes = notes;

        await db.collection('feedback').doc(feedbackId).update(updateData);

        res.json({
            success: true,
            message: 'Feedback updated successfully'
        });
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
});

// Add response to feedback (admin only)
app.post('/api/admin/feedback/:feedbackId/respond', authenticateAdmin, async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { message, sendEmail } = req.body;

        const feedbackDoc = await db.collection('feedback').doc(feedbackId).get();

        if (!feedbackDoc.exists) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const feedbackData = feedbackDoc.data();
        const response = {
            message,
            respondedBy: req.user.email || 'Admin',
            respondedAt: new Date().toISOString()
        };

        // Add response to feedback
        await db.collection('feedback').doc(feedbackId).update({
            responses: admin.firestore.FieldValue.arrayUnion(response),
            status: 'in-progress',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Send email if requested
        if (sendEmail && feedbackData.userEmail) {
            try {
                await emailService.sendEmail(
                    feedbackData.userEmail,
                    `Re: ${feedbackData.subject}`,
                    message
                );
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Continue even if email fails
            }
        }

        res.json({
            success: true,
            message: 'Response added successfully'
        });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({ error: 'Failed to add response' });
    }
});

// Delete feedback (admin only)
app.delete('/api/admin/feedback/:feedbackId', authenticateAdmin, async (req, res) => {
    try {
        const { feedbackId } = req.params;

        await db.collection('feedback').doc(feedbackId).delete();

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

// ========================================
// PUSH NOTIFICATIONS ENDPOINTS
// ========================================

// Send push notification (admin only)
app.post('/api/admin/notifications/send', authenticateAdmin, async (req, res) => {
    try {
        const { title, body, target, userEmail } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        let recipientTokens = [];
        let recipientCount = 0;

        // Get user tokens based on target
        if (target === 'specific') {
            if (!userEmail) {
                return res.status(400).json({ error: 'User email required for specific targeting' });
            }

            const userSnapshot = await db.collection('users')
                .where('email', '==', userEmail)
                .limit(1)
                .get();

            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                if (userData.fcmToken) {
                    recipientTokens.push(userData.fcmToken);
                    recipientCount = 1;
                }
            }
        } else {
            let query = db.collection('users');

            if (target === 'premium') {
                query = query.where('subscription.tier', 'in', ['premium', 'elite', 'lifetime']);
            } else if (target === 'free') {
                query = query.where('subscription.tier', '==', 'free');
            }

            const usersSnapshot = await query.get();
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.fcmToken) {
                    recipientTokens.push(userData.fcmToken);
                }
            });
            recipientCount = recipientTokens.length;
        }

        // Send notification via Firebase Cloud Messaging
        if (recipientTokens.length > 0 && messaging) {
            const message = {
                notification: {
                    title,
                    body
                },
                tokens: recipientTokens.slice(0, 500) // FCM limit
            };

            try {
                await messaging.sendMulticast(message);
            } catch (fcmError) {
                console.error('FCM send error:', fcmError);
                // Continue even if FCM fails
            }
        }

        // Log notification
        await db.collection('notifications').add({
            title,
            body,
            target,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            sentBy: req.user.email,
            recipientCount,
            status: 'sent'
        });

        res.json({
            success: true,
            recipientCount,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Get notification history (admin only)
app.get('/api/admin/notifications', authenticateAdmin, async (req, res) => {
    try {
        const notificationsSnapshot = await db.collection('notifications')
            .orderBy('sentAt', 'desc')
            .limit(100)
            .get();

        const notifications = [];
        notificationsSnapshot.forEach(doc => {
            const data = doc.data();
            notifications.push({
                id: doc.id,
                ...data,
                sentAt: data.sentAt?.toDate().toISOString()
            });
        });

        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// ========================================
// PROMO CODES ENDPOINTS
// ========================================

// Get all promo codes (admin only)
app.get('/api/admin/promo-codes', authenticateAdmin, async (req, res) => {
    try {
        const codesSnapshot = await db.collection('promoCodes')
            .orderBy('createdAt', 'desc')
            .get();

        const codes = [];
        codesSnapshot.forEach(doc => {
            const data = doc.data();
            codes.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
                expiresAt: data.expiresAt?.toDate().toISOString()
            });
        });

        res.json({ codes });
    } catch (error) {
        console.error('Get promo codes error:', error);
        res.status(500).json({ error: 'Failed to fetch promo codes' });
    }
});

// Create promo code (admin only)
app.post('/api/admin/promo-codes', authenticateAdmin, async (req, res) => {
    try {
        const { code, description, discountType, discountValue, tier, maxUses, expiresAt } = req.body;

        if (!code || !discountType || !discountValue || !tier) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if code already exists
        const existingCode = await db.collection('promoCodes')
            .where('code', '==', code.toUpperCase())
            .limit(1)
            .get();

        if (!existingCode.empty) {
            return res.status(400).json({ error: 'Promo code already exists' });
        }

        const promoData = {
            code: code.toUpperCase(),
            description: description || '',
            discountType,
            discountValue: Number(discountValue),
            tier,
            maxUses: Number(maxUses) || 100,
            currentUses: 0,
            expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: req.user.email
        };

        const docRef = await db.collection('promoCodes').add(promoData);

        res.json({
            success: true,
            codeId: docRef.id,
            message: 'Promo code created successfully'
        });
    } catch (error) {
        console.error('Create promo code error:', error);
        res.status(500).json({ error: 'Failed to create promo code' });
    }
});

// Update promo code (admin only)
app.patch('/api/admin/promo-codes/:codeId', authenticateAdmin, async (req, res) => {
    try {
        const { codeId } = req.params;
        const updates = req.body;

        await db.collection('promoCodes').doc(codeId).update({
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Promo code updated successfully'
        });
    } catch (error) {
        console.error('Update promo code error:', error);
        res.status(500).json({ error: 'Failed to update promo code' });
    }
});

// Delete promo code (admin only)
app.delete('/api/admin/promo-codes/:codeId', authenticateAdmin, async (req, res) => {
    try {
        const { codeId } = req.params;

        await db.collection('promoCodes').doc(codeId).delete();

        res.json({
            success: true,
            message: 'Promo code deleted successfully'
        });
    } catch (error) {
        console.error('Delete promo code error:', error);
        res.status(500).json({ error: 'Failed to delete promo code' });
    }
});

// ========================================
// CONTENT MANAGEMENT ENDPOINTS
// ========================================

// Get app content (admin only)
app.get('/api/admin/content', authenticateAdmin, async (req, res) => {
    try {
        const { type } = req.query;

        let query = db.collection('appContent');
        if (type && type !== 'all') {
            query = query.where('type', '==', type);
        }

        const contentSnapshot = await query.orderBy('order', 'asc').get();

        const contents = [];
        contentSnapshot.forEach(doc => {
            const data = doc.data();
            contents.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString()
            });
        });

        res.json({ contents });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// Create app content (admin only)
app.post('/api/admin/content', authenticateAdmin, async (req, res) => {
    try {
        const { type, title, content, category, author, active } = req.body;

        if (!type || !title || !content) {
            return res.status(400).json({ error: 'Type, title, and content are required' });
        }

        const contentData = {
            type,
            title,
            content,
            category: category || null,
            author: author || null,
            active: active !== undefined ? active : true,
            order: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('appContent').add(contentData);

        res.json({
            success: true,
            contentId: docRef.id,
            message: 'Content created successfully'
        });
    } catch (error) {
        console.error('Create content error:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});

// Update app content (admin only)
app.put('/api/admin/content/:contentId', authenticateAdmin, async (req, res) => {
    try {
        const { contentId } = req.params;
        const updates = { ...req.body };

        delete updates.createdAt;
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('appContent').doc(contentId).update(updates);

        res.json({
            success: true,
            message: 'Content updated successfully'
        });
    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

// Patch app content (admin only)
app.patch('/api/admin/content/:contentId', authenticateAdmin, async (req, res) => {
    try {
        const { contentId } = req.params;
        const updates = { ...req.body };

        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('appContent').doc(contentId).update(updates);

        res.json({
            success: true,
            message: 'Content updated successfully'
        });
    } catch (error) {
        console.error('Patch content error:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

// Delete app content (admin only)
app.delete('/api/admin/content/:contentId', authenticateAdmin, async (req, res) => {
    try {
        const { contentId } = req.params;

        await db.collection('appContent').doc(contentId).delete();

        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

// ========================================
// ACTIVITY LOGS ENDPOINTS
// ========================================

// Helper function to log admin activity
const logAdminActivity = async (adminId, adminEmail, action, resource, resourceId, details, status = 'success', ipAddress = null) => {
    try {
        await db.collection('activityLogs').add({
            adminId,
            adminEmail,
            action,
            resource,
            resourceId: resourceId || null,
            details: details || null,
            status,
            ipAddress,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

// Get activity logs (admin only)
app.get('/api/admin/activity-logs', authenticateAdmin, async (req, res) => {
    try {
        const { action, status, dateFrom, dateTo, page = 1, limit = 50 } = req.query;

        let query = db.collection('activityLogs');

        if (action && action !== 'all') {
            query = query.where('action', '==', action);
        }

        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        if (dateFrom) {
            query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(new Date(dateFrom)));
        }

        if (dateTo) {
            query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(new Date(dateTo)));
        }

        // Get total count
        const totalSnapshot = await query.get();
        const total = totalSnapshot.size;

        // Get paginated results
        query = query.orderBy('timestamp', 'desc')
            .limit(parseInt(limit))
            .offset((parseInt(page) - 1) * parseInt(limit));

        const logsSnapshot = await query.get();

        const logs = [];
        logsSnapshot.forEach(doc => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate().toISOString()
            });
        });

        res.json({ logs, total });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Export activity logs as CSV (admin only)
app.get('/api/admin/activity-logs/export', authenticateAdmin, async (req, res) => {
    try {
        const { action, status, dateFrom, dateTo } = req.query;

        let query = db.collection('activityLogs');

        if (action && action !== 'all') {
            query = query.where('action', '==', action);
        }

        if (status && status !== 'all') {
            query = query.where('status', '==', status);
        }

        if (dateFrom) {
            query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(new Date(dateFrom)));
        }

        if (dateTo) {
            query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(new Date(dateTo)));
        }

        const logsSnapshot = await query.orderBy('timestamp', 'desc').limit(1000).get();

        // Generate CSV
        let csv = 'Timestamp,Admin Email,Action,Resource,Resource ID,Details,Status,IP Address\n';

        logsSnapshot.forEach(doc => {
            const data = doc.data();
            const row = [
                data.timestamp?.toDate().toISOString() || '',
                data.adminEmail || '',
                data.action || '',
                data.resource || '',
                data.resourceId || '',
                (data.details || '').replace(/,/g, ';'),
                data.status || '',
                data.ipAddress || ''
            ];
            csv += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Export activity logs error:', error);
        res.status(500).json({ error: 'Failed to export activity logs' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('Digital Coffee server running on port ' + PORT);
    console.log('Audio files will be served from /audio directory');
    console.log('CDN-ready with proper caching headers');
    console.log('Firebase integrated and ready');
});
