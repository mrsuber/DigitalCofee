# Firebase Setup - Digital Coffee

This document covers the complete Firebase integration for Digital Coffee, including authentication, database, push notifications, and analytics for the mobile app.

## Why Firebase for Digital Coffee?

### Use Cases

| Firebase Service | Digital Coffee Use Case |
|------------------|------------------------|
| **Authentication** | User sign up/login (email, Google, social) |
| **Firestore** | User profiles, session tracking, playlists |
| **Cloud Messaging** | Push notifications for timed audio sessions |
| **Analytics** | Track user behavior, session completion rates |
| **Cloud Functions** | Server-side logic, triggers |
| **Cloud Storage** | Optional: User-uploaded content, avatars |

### Why Firebase?

✅ **Easy mobile integration** - Works seamlessly with React Native
✅ **Real-time sync** - Perfect for session tracking
✅ **Free tier** - Generous free quota for MVP
✅ **Scalable** - Grows with your user base
✅ **Built-in auth** - No need to build authentication from scratch
✅ **Push notifications** - FCM (Firebase Cloud Messaging) included
✅ **Analytics** - Track user engagement automatically

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         React Native Mobile App         │
│  (iOS/Android - Digital Coffee)         │
└──────────────┬──────────────────────────┘
               │
               │ Firebase SDK
               ▼
┌─────────────────────────────────────────┐
│           Firebase Services             │
├─────────────────────────────────────────┤
│  • Authentication (Email, Google)       │
│  • Firestore Database                   │
│  • Cloud Messaging (FCM)                │
│  • Analytics                            │
│  • Cloud Functions (optional)           │
└──────────────┬──────────────────────────┘
               │
               │ Admin SDK
               ▼
┌─────────────────────────────────────────┐
│    Node.js Backend (VPS)                │
│    - Admin operations                   │
│    - Audio file serving                 │
│    - Custom API endpoints               │
└─────────────────────────────────────────┘
```

## Prerequisites

Before starting, ensure you have:
- Google account (for Firebase Console access)
- Node.js installed locally (for Firebase CLI)
- Access to Digital Coffee project repository

## Step 1: Create Firebase Project

### 1.1 Access Firebase Console

1. **Go to Firebase Console:**
   - URL: https://console.firebase.google.com
   - Sign in with Google account (mohamad.siysinyuy@gmail.com)

2. **Create new project:**
   - Click "Add project" or "+ Create a project"
   - Enter project name: `Digital Coffee`
   - Project ID: `digital-coffee-app` (or auto-generated)
   - Click "Continue"

3. **Enable Google Analytics:**
   - Toggle: **Enable Google Analytics** (recommended)
   - Click "Continue"

4. **Configure Google Analytics:**
   - Select or create Analytics account: "Digital Coffee Analytics"
   - Location: Cameroon (or your region)
   - Accept terms
   - Click "Create project"

5. **Wait for provisioning:**
   - Firebase will set up your project (~30 seconds)
   - Click "Continue" when ready

### 1.2 Project Settings

**Important project information:**
```
Project Name: Digital Coffee
Project ID: digital-coffee-app
Project Number: (auto-generated, e.g., 123456789012)
Web API Key: (auto-generated)
```

**Save these values - you'll need them later!**

## Step 2: Set Up Authentication

### 2.1 Enable Authentication

1. **Navigate to Authentication:**
   - Firebase Console → Build → Authentication
   - Click "Get started"

2. **Enable Sign-in Methods:**

**Email/Password:**
1. Click "Sign-in method" tab
2. Click "Email/Password"
3. Enable "Email/Password"
4. Enable "Email link (passwordless sign-in)" - Optional
5. Click "Save"

**Google Sign-In:**
1. Click "Google" provider
2. Enable Google sign-in
3. Project support email: `info@camsoltechnology.com`
4. Click "Save"

**Future providers (optional):**
- Facebook (requires Facebook app setup)
- Apple (for iOS)
- Anonymous (for guest access)

### 2.2 Configure Auth Settings

**Settings → Authentication → Settings:**

```
Authorized domains:
- localhost (for testing)
- digitalcoffee.cafe (production)
- digital-coffee-app.web.app (Firebase Hosting)
```

**Add custom domain:**
1. Click "Add domain"
2. Enter: `digitalcoffee.cafe`
3. Click "Add"

### 2.3 User Management

**Initial setup:**
- Enable "One account per email address" (recommended)
- Set password policy: Enforce password strength
- Enable email verification (recommended)

## Step 3: Set Up Firestore Database

### 3.1 Create Firestore Database

1. **Navigate to Firestore:**
   - Firebase Console → Build → Firestore Database
   - Click "Create database"

2. **Choose security mode:**
   - Select "Start in **production mode**" (secure by default)
   - Click "Next"

3. **Select location:**
   - Choose: `eur3 (europe-west)` (closest to Cameroon)
   - Note: Cannot be changed later!
   - Click "Enable"

### 3.2 Database Structure

**Recommended Firestore collections:**

```
/users/{userId}
  ├── email: string
  ├── name: string
  ├── createdAt: timestamp
  ├── preferences: object
  │   ├── favoriteWaveType: string
  │   ├── sessionGoal: string
  │   └── notificationsEnabled: boolean
  └── stats: object
      ├── totalSessions: number
      ├── totalListeningTime: number
      └── lastSessionDate: timestamp

/sessions/{sessionId}
  ├── userId: string (reference)
  ├── trackId: string
  ├── waveType: string (alpha/beta)
  ├── startedAt: timestamp
  ├── endedAt: timestamp
  ├── duration: number (seconds)
  ├── completed: boolean
  └── rating: number (1-5, optional)

/tracks/{trackId}
  ├── title: string
  ├── description: string
  ├── waveType: string
  ├── frequencyRange: string
  ├── duration: number
  ├── fileUrl: string
  ├── thumbnailUrl: string (optional)
  ├── plays: number
  └── createdAt: timestamp

/playlists/{playlistId}
  ├── name: string
  ├── description: string
  ├── userId: string (creator)
  ├── isPublic: boolean
  ├── tracks: array of trackIds
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### 3.3 Create Initial Collections

**Method 1: Firebase Console**
1. Click "Start collection"
2. Collection ID: `users`
3. Click "Next"
4. Add first document (test user):
   ```
   Document ID: test_user_001
   Fields:
   - email (string): test@digitalcoffee.cafe
   - name (string): Test User
   - createdAt (timestamp): (auto)
   ```
5. Click "Save"

**Method 2: Using Node.js (later)**

### 3.4 Security Rules

**Firestore Rules:** (Firestore Database → Rules tab)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Read: User can read own data
      allow read: if isSignedIn() && isOwner(userId);

      // Write: User can create/update own data
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);

      // Delete: User can delete own data
      allow delete: if isSignedIn() && isOwner(userId);
    }

    // Sessions collection
    match /sessions/{sessionId} {
      // Read: User can read own sessions
      allow read: if isSignedIn() &&
                     resource.data.userId == request.auth.uid;

      // Write: User can create/update own sessions
      allow create: if isSignedIn() &&
                       request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() &&
                       resource.data.userId == request.auth.uid;
    }

    // Tracks collection (read-only for users)
    match /tracks/{trackId} {
      // All authenticated users can read tracks
      allow read: if isSignedIn();

      // Only admins can write (implement admin check)
      allow write: if false; // TODO: Implement admin check
    }

    // Playlists collection
    match /playlists/{playlistId} {
      // Read: Public playlists or own playlists
      allow read: if isSignedIn() &&
                     (resource.data.isPublic == true ||
                      resource.data.userId == request.auth.uid);

      // Write: User can create/update own playlists
      allow create: if isSignedIn() &&
                       request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() &&
                       resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() &&
                       resource.data.userId == request.auth.uid;
    }
  }
}
```

**Click "Publish" to apply rules**

### 3.5 Indexes

**Composite indexes** (will be created automatically when needed):

Example indexes to create manually:
1. Firestore → Indexes tab → Click "Add index"

**Index 1: User sessions by date**
```
Collection: sessions
Fields:
- userId (Ascending)
- startedAt (Descending)
```

**Index 2: Track plays**
```
Collection: tracks
Fields:
- waveType (Ascending)
- plays (Descending)
```

## Step 4: Set Up Cloud Messaging (FCM)

### 4.1 Enable Cloud Messaging

1. **Navigate to Cloud Messaging:**
   - Firebase Console → Build → Cloud Messaging
   - Automatically enabled for new projects

2. **Get Server Key:**
   - Settings → Project settings → Cloud Messaging tab
   - Copy "Server key" (for backend use)
   - Copy "Sender ID" (for mobile app)

### 4.2 Configure for iOS (Apple Push Notification)

**Requirements:**
- Apple Developer account
- APNs Authentication Key or Certificate

**Steps:**
1. Settings → Cloud Messaging → iOS app configuration
2. Upload APNs Auth Key (.p8 file)
3. Enter Key ID and Team ID
4. Click "Upload"

### 4.3 Configure for Android

**Android configuration is automatic** - uses FCM directly

## Step 5: Set Up Firebase for Web/Admin

### 5.1 Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

### 5.2 Initialize Firebase in Project

```bash
# Navigate to project directory
cd /Users/camsoltechnology/dev/camsol_company/divisionalOfficer/DigitalCofee

# Initialize Firebase
firebase init

# Select features:
# - Firestore
# - Functions (optional)
# - Hosting (optional)

# Choose existing project: digital-coffee-app

# Firestore rules file: firestore.rules (default)
# Firestore indexes file: firestore.indexes.json (default)

# Complete setup
```

### 5.3 Add Firebase to Web App

1. **Register web app:**
   - Firebase Console → Project settings
   - Scroll to "Your apps"
   - Click web icon (</>)
   - App nickname: `Digital Coffee Web`
   - Enable Firebase Hosting: Optional
   - Click "Register app"

2. **Copy Firebase config:**

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "digital-coffee-app.firebaseapp.com",
  projectId: "digital-coffee-app",
  storageBucket: "digital-coffee-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

**Save this config - needed for mobile app!**

## Step 6: Backend Integration (Node.js)

### 6.1 Install Firebase Admin SDK

```bash
# SSH to VPS
ssh root@76.13.41.99

# Navigate to app directory
cd /var/www/digitalcoffee

# Install Firebase Admin SDK
npm install firebase-admin
```

### 6.2 Generate Service Account Key

1. **Firebase Console → Project settings → Service accounts**
2. Click "Generate new private key"
3. Click "Generate key"
4. Save JSON file securely: `digital-coffee-firebase-adminsdk.json`

5. **Upload to VPS:**
```bash
# From local machine
scp digital-coffee-firebase-adminsdk.json root@76.13.41.99:/var/www/digitalcoffee/config/
```

⚠️ **Security:** Never commit this file to git!

### 6.3 Initialize Firebase Admin in Node.js

**Create:** `/var/www/digitalcoffee/config/firebase.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./digital-coffee-firebase-adminsdk.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://digital-coffee-app.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

module.exports = { admin, db, auth, messaging };
```

### 6.4 Update Express App with Firebase

**Update:** `/var/www/digitalcoffee/index.js`

```javascript
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { admin, db, auth, messaging } = require('./config/firebase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp3') || filePath.endsWith('.wav') || filePath.endsWith('.ogg')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Accept-Ranges', 'bytes');
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Firebase Auth Middleware
const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Digital Coffee API is running' });
});

// User endpoints
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

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
            preferences: {
                favoriteWaveType: null,
                sessionGoal: null,
                notificationsEnabled: true
            },
            stats: {
                totalSessions: 0,
                totalListeningTime: 0,
                lastSessionDate: null
            }
        });

        res.status(201).json({
            success: true,
            userId: userRecord.uid,
            message: 'User created successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Protected route example
app.get('/api/user/profile', verifyFirebaseToken, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: userDoc.data()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Session tracking
app.post('/api/sessions/start', verifyFirebaseToken, async (req, res) => {
    try {
        const { trackId, waveType } = req.body;

        const sessionRef = await db.collection('sessions').add({
            userId: req.user.uid,
            trackId,
            waveType,
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            endedAt: null,
            duration: 0,
            completed: false
        });

        res.json({
            success: true,
            sessionId: sessionRef.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sessions/:sessionId/end', verifyFirebaseToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { duration, completed } = req.body;

        await db.collection('sessions').doc(sessionId).update({
            endedAt: admin.firestore.FieldValue.serverTimestamp(),
            duration,
            completed
        });

        // Update user stats
        await db.collection('users').doc(req.user.uid).update({
            'stats.totalSessions': admin.firestore.FieldValue.increment(1),
            'stats.totalListeningTime': admin.firestore.FieldValue.increment(duration),
            'stats.lastSessionDate': admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Session ended successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Audio tracks list
app.get('/api/audio/tracks', async (req, res) => {
    try {
        const tracksSnapshot = await db.collection('tracks')
            .orderBy('plays', 'desc')
            .limit(50)
            .get();

        const tracks = [];
        tracksSnapshot.forEach(doc => {
            tracks.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            success: true,
            tracks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Push notification endpoint
app.post('/api/notifications/send', verifyFirebaseToken, async (req, res) => {
    try {
        const { title, body, fcmToken } = req.body;

        const message = {
            notification: {
                title,
                body
            },
            token: fcmToken
        };

        const response = await messaging.send(message);

        res.json({
            success: true,
            messageId: response
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Digital Coffee server running on port ${PORT}`);
    console.log(`Firebase Admin SDK initialized`);
    console.log(`Audio files will be served from /audio directory`);
    console.log(`CDN-ready with proper caching headers`);
});
```

### 6.5 Update Environment Variables

**Add to `/var/www/digitalcoffee/.env`:**

```bash
# Existing variables...
PORT=3001
NODE_ENV=production

# Firebase Configuration
FIREBASE_PROJECT_ID=digital-coffee-app
FIREBASE_DATABASE_URL=https://digital-coffee-app.firebaseio.com
FIREBASE_STORAGE_BUCKET=digital-coffee-app.appspot.com
```

### 6.6 Restart Application

```bash
ssh root@76.13.41.99 "cd /var/www/digitalcoffee && npm install && pm2 restart digitalcoffee"
```

## Step 7: React Native Integration

### 7.1 Install Firebase SDK (React Native)

```bash
# When you create the React Native project
cd /path/to/digital-coffee-mobile

# Install Firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/messaging
npm install @react-native-firebase/analytics

# For iOS (run after npm install)
cd ios && pod install && cd ..
```

### 7.2 Configure for iOS

**Create:** `ios/digital-coffee/GoogleService-Info.plist`

1. Firebase Console → Project settings → iOS apps
2. Register iOS app
   - Bundle ID: `com.camsol.digitalcoffee`
   - App nickname: `Digital Coffee iOS`
3. Download `GoogleService-Info.plist`
4. Add to Xcode project

### 7.3 Configure for Android

**Create:** `android/app/google-services.json`

1. Firebase Console → Project settings → Android apps
2. Register Android app
   - Package name: `com.camsol.digitalcoffee`
   - App nickname: `Digital Coffee Android`
3. Download `google-services.json`
4. Place in `android/app/`

**Update:** `android/build.gradle`

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**Update:** `android/app/build.gradle`

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'
```

### 7.4 Firebase Service Example (React Native)

**Create:** `src/services/firebaseService.js`

```javascript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';

export const FirebaseService = {
  // Authentication
  async signUp(email, password, name) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });

      // Create user document
      await firestore().collection('users').doc(userCredential.user.uid).set({
        email,
        name,
        createdAt: firestore.FieldValue.serverTimestamp(),
        preferences: {
          favoriteWaveType: null,
          sessionGoal: null,
          notificationsEnabled: true
        },
        stats: {
          totalSessions: 0,
          totalListeningTime: 0,
          lastSessionDate: null
        }
      });

      analytics().logEvent('sign_up', { method: 'email' });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      analytics().logEvent('login', { method: 'email' });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      await auth().signOut();
      analytics().logEvent('logout');
    } catch (error) {
      throw error;
    }
  },

  // Firestore
  async getUserProfile(userId) {
    try {
      const doc = await firestore().collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      throw error;
    }
  },

  async updateUserPreferences(userId, preferences) {
    try {
      await firestore().collection('users').doc(userId).update({
        preferences: preferences
      });
    } catch (error) {
      throw error;
    }
  },

  async getTracks(waveType = null) {
    try {
      let query = firestore().collection('tracks');

      if (waveType) {
        query = query.where('waveType', '==', waveType);
      }

      const snapshot = await query.orderBy('plays', 'desc').limit(50).get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  },

  // Session tracking
  async startSession(userId, trackId, waveType) {
    try {
      const sessionRef = await firestore().collection('sessions').add({
        userId,
        trackId,
        waveType,
        startedAt: firestore.FieldValue.serverTimestamp(),
        endedAt: null,
        duration: 0,
        completed: false
      });

      analytics().logEvent('session_start', {
        wave_type: waveType,
        track_id: trackId
      });

      return sessionRef.id;
    } catch (error) {
      throw error;
    }
  },

  async endSession(sessionId, userId, duration, completed) {
    try {
      await firestore().collection('sessions').doc(sessionId).update({
        endedAt: firestore.FieldValue.serverTimestamp(),
        duration,
        completed
      });

      // Update user stats
      await firestore().collection('users').doc(userId).update({
        'stats.totalSessions': firestore.FieldValue.increment(1),
        'stats.totalListeningTime': firestore.FieldValue.increment(duration),
        'stats.lastSessionDate': firestore.FieldValue.serverTimestamp()
      });

      analytics().logEvent('session_complete', {
        duration,
        completed
      });
    } catch (error) {
      throw error;
    }
  },

  // Push Notifications
  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await messaging().getToken();
        return fcmToken;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  async saveFCMToken(userId, token) {
    try {
      await firestore().collection('users').doc(userId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  },

  // Analytics
  logScreenView(screenName) {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName
    });
  },

  logCustomEvent(eventName, params = {}) {
    analytics().logEvent(eventName, params);
  }
};

export default FirebaseService;
```

## Step 8: Testing Firebase Integration

### 8.1 Test Authentication

**Using Firebase Console:**
1. Authentication → Users tab
2. Click "Add user"
3. Enter email/password
4. Click "Add user"

**Using cURL:**
```bash
# Register new user
curl -X POST https://digitalcoffee.cafe/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@digitalcoffee.cafe",
    "password": "Test123456!",
    "name": "Test User"
  }'
```

### 8.2 Test Firestore

**Read data:**
```bash
# Get user profile (requires auth token)
curl -X GET https://digitalcoffee.cafe/api/user/profile \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

**Using Firebase Console:**
1. Firestore Database → Data tab
2. Navigate to `users` collection
3. Verify test user exists

### 8.3 Test Push Notifications

**Send test notification:**
1. Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Enter FCM token
4. Add notification title/body
5. Click "Test"

## Step 9: Firebase Security Best Practices

### 9.1 Security Checklist

**Authentication:**
- ✅ Enable email verification
- ✅ Enforce strong passwords
- ✅ Implement password reset flow
- ✅ Use secure token handling
- ✅ Implement session timeouts

**Firestore:**
- ✅ Use security rules (see Step 3.4)
- ✅ Validate data on server-side
- ✅ Implement rate limiting
- ✅ Never trust client data
- ✅ Use field-level permissions

**API Keys:**
- ✅ Restrict API key usage (HTTP referrers, IP addresses)
- ✅ Never commit service account JSON to git
- ✅ Rotate keys regularly
- ✅ Use environment variables

**Cloud Messaging:**
- ✅ Validate FCM tokens
- ✅ Handle token refresh
- ✅ Implement topic subscriptions carefully
- ✅ Rate limit notification sending

### 9.2 Configure API Key Restrictions

1. **Google Cloud Console:**
   - https://console.cloud.google.com
   - Select project: `Digital Coffee`
   - APIs & Services → Credentials

2. **Restrict API keys:**
   - Click on API key
   - Application restrictions:
     - HTTP referrers: `digitalcoffee.cafe/*`
   - API restrictions:
     - Restrict key
     - Select: Firebase, Firestore, FCM
   - Click "Save"

## Step 10: Monitoring & Analytics

### 10.1 Firebase Analytics Dashboard

**Access:**
- Firebase Console → Analytics → Dashboard

**Key metrics:**
- Active users (daily, weekly, monthly)
- User retention
- Events (session_start, session_complete)
- Screen views
- User demographics

### 10.2 Custom Events

**Track important events:**
```javascript
// Track audio playback
analytics().logEvent('audio_play', {
  track_id: trackId,
  wave_type: waveType,
  duration: duration
});

// Track feature usage
analytics().logEvent('feature_used', {
  feature_name: 'playlist_create'
});
```

### 10.3 Crashlytics (Optional)

**Install:**
```bash
npm install @react-native-firebase/crashlytics
```

**Enable in Firebase Console:**
- Quality → Crashlytics
- Follow setup instructions

## Step 11: Firebase Cloud Functions (Optional)

### 11.1 Set Up Cloud Functions

```bash
# Initialize Cloud Functions
firebase init functions

# Choose TypeScript or JavaScript
# Install dependencies

cd functions
npm install
```

### 11.2 Example Cloud Functions

**Create:** `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger: User created
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Send welcome email
  console.log('New user created:', user.email);

  // Create initial user document (if not created by app)
  await admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});

// Trigger: Session completed
exports.onSessionComplete = functions.firestore
  .document('sessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Check if session just completed
    if (!oldData.completed && newData.completed) {
      const userId = newData.userId;

      // Send congratulations notification
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const fcmToken = userDoc.data().fcmToken;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: 'Session Complete!',
            body: 'Great job! You completed your brainwave session.'
          }
        });
      }
    }
  });

// Scheduled function: Daily reminder
exports.sendDailyReminder = functions.pubsub
  .schedule('0 9 * * *') // Every day at 9 AM
  .timeZone('Africa/Douala')
  .onRun(async (context) => {
    // Get users who want reminders
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('preferences.notificationsEnabled', '==', true)
      .get();

    const messages = [];

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        messages.push({
          token: data.fcmToken,
          notification: {
            title: 'Time for your Digital Coffee!',
            body: 'Start your day with a creative boost.'
          }
        });
      }
    });

    if (messages.length > 0) {
      await admin.messaging().sendAll(messages);
    }

    console.log(`Sent ${messages.length} reminder notifications`);
  });
```

### 11.3 Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onUserCreate
```

## Step 12: Cost Management

### 12.1 Firebase Free Tier Limits

| Service | Free Quota | Overage Cost |
|---------|-----------|--------------|
| **Authentication** | Unlimited | Free |
| **Firestore** | 1 GB storage, 50K reads/day | $0.06/100K reads |
| **Cloud Storage** | 5 GB storage, 1 GB/day downloads | $0.026/GB |
| **Cloud Messaging** | Unlimited | Free |
| **Cloud Functions** | 125K invocations/month | $0.40/1M invocations |
| **Analytics** | Unlimited | Free |

### 12.2 Monitor Usage

**Firebase Console → Usage and billing:**
- Set budget alerts
- Monitor daily usage
- Set up email notifications

**Recommended budgets for MVP:**
- Start with $10/month budget alert
- Monitor for first month
- Adjust based on actual usage

### 12.3 Optimization Tips

**Reduce Firestore reads:**
- Implement client-side caching
- Use Firestore offline persistence
- Batch reads when possible
- Use Firebase Analytics events instead of Firestore writes

**Reduce Cloud Function invocations:**
- Use batched operations
- Implement debouncing
- Cache results when possible

## Troubleshooting

### Firebase Not Connecting

**Check:**
1. Firebase config is correct
2. API keys are not restricted
3. Authorized domains include your domain
4. Internet connectivity

**Debug:**
```javascript
// Enable debug logging
firebase.setLogLevel('debug');
```

### Authentication Errors

**Common issues:**
- Email already exists
- Weak password
- Invalid email format
- User not found

**Solution:**
- Check error codes in documentation
- Implement proper error handling
- Show user-friendly messages

### Firestore Permission Denied

**Check:**
1. Security rules are correct
2. User is authenticated
3. User owns the document (if required)

**Test rules:**
- Firebase Console → Firestore → Rules → Simulator
- Test read/write operations

### Push Notifications Not Working

**iOS:**
- APNs certificate uploaded
- App has notification permissions
- FCM token is valid

**Android:**
- google-services.json in place
- App has notification permissions
- FCM token is valid

**Debug:**
```javascript
// Check if token is retrieved
messaging().getToken().then(token => {
  console.log('FCM Token:', token);
});
```

## Next Steps

After Firebase setup:

1. **Implement authentication UI** in React Native app
2. **Create user registration/login screens**
3. **Integrate session tracking** in audio player
4. **Set up push notifications** for reminders
5. **Implement user profiles** with stats
6. **Add playlist management**
7. **Set up analytics tracking**
8. **Test thoroughly** before launch

## Resources

### Firebase Documentation
- Firebase Console: https://console.firebase.google.com
- Documentation: https://firebase.google.com/docs
- React Native Firebase: https://rnfirebase.io
- Cloud Functions: https://firebase.google.com/docs/functions

### Support
- Stack Overflow: [firebase] tag
- Firebase Community Slack
- GitHub Issues: https://github.com/firebase/firebase-js-sdk

---

**Document Version:** 1.0
**Last Updated:** February 23, 2026
**Status:** Ready for Implementation
**Next:** Mobile App Development with Firebase Integration
