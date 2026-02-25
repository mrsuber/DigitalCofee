# Digital Coffee - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Migration: React Native to Expo](#technology-migration)
3. [Authentication System](#authentication-system)
4. [Backend Infrastructure](#backend-infrastructure)
5. [Email Service Integration](#email-service-integration)
6. [Current Features](#current-features)
7. [Technical Architecture](#technical-architecture)
8. [Deployment](#deployment)

---

## Project Overview

**Digital Coffee** is a mobile application designed to enhance mental performance through binaural beats - scientifically-designed audio frequencies that help users achieve optimal brain states for creativity, focus, and relaxation.

### Core Concept
- **Alpha Waves (8-12 Hz)**: For creativity, relaxation, and ideation
- **Beta Waves (12-30 Hz)**: For focus, alertness, and active thinking

---

## Technology Migration

### From React Native to Expo

**When**: Early development phase
**Decision Point**: During initial iOS setup and Firebase integration

#### Why We Switched

1. **Simplified Development Workflow**
   - Expo provides a managed workflow that eliminates complex native configuration
   - No need for Xcode or Android Studio for development
   - Faster iteration and testing cycles

2. **Firebase Integration Challenges**
   - React Native Firebase required complex native module linking
   - iOS build configuration was becoming overly complicated
   - CocoaPods dependency management issues

3. **Developer Experience**
   - Expo Go app for instant testing on physical devices
   - Over-the-air updates without app store submissions
   - Built-in development tools and debugging

4. **Cross-Platform Consistency**
   - Expo ensures consistent behavior across iOS and Android
   - Handles platform-specific configurations automatically
   - Reduces platform-specific bugs

#### Migration Process

**Original Stack**:
```
- React Native CLI
- @react-native-firebase packages
- Manual iOS/Android configuration
- CocoaPods for iOS dependencies
```

**New Stack**:
```
- Expo SDK
- Firebase Web SDK (not React Native Firebase)
- Expo managed workflow
- Built-in expo-dev-client
```

**Key Changes Made**:
1. Migrated from `@react-native-firebase/*` to `firebase` (Web SDK)
2. Removed native iOS/Android folders
3. Created new Expo project structure at `/mobile-expo`
4. Updated all Firebase imports to use Web SDK
5. Configured Firebase using web configuration

---

## Authentication System

### Overview
Comprehensive authentication system supporting multiple sign-in methods with email verification and account linking capabilities.

### Features Implemented

#### 1. Email/Password Authentication

**Registration Flow** (`RegisterScreen.tsx`):
```typescript
1. User enters email, password, and name
2. Client-side validation (email format, password length, password match)
3. Create Firebase Auth account
4. Create user profile in backend database
5. Send email verification
6. Navigate to EmailVerificationScreen
```

**Key Files**:
- `/mobile-expo/src/screens/auth/RegisterScreen.tsx` - Registration UI
- `/mobile-expo/src/services/firebase.ts` - Firebase authentication logic
- `/index.js:84-126` - Backend registration endpoint

**Security Features**:
- Password minimum length (6 characters)
- Email format validation
- Password confirmation matching
- Firebase email verification required before access

#### 2. Email Verification System

**Problem Solved**: Users with unverified emails were able to bypass verification and access the app.

**Solution** (`EmailVerificationScreen.tsx`):
- Dedicated verification screen instead of popup alerts
- Resend verification email with 60-second cooldown (prevents spam)
- Clear instructions and troubleshooting tips
- Manual verification check button

**Authentication Guard** (`AppNavigator.tsx:19-44`):
```typescript
// Only verified users can access the app
if (currentUser) {
  const isEmailPasswordUser = currentUser.providerData.some(
    provider => provider.providerId === 'password',
  );

  if (isEmailPasswordUser && !currentUser.emailVerified) {
    setUser(null); // Keep in auth stack
  } else {
    setUser(currentUser); // Allow access to home
  }
}
```

**Flow**:
1. User registers → EmailVerificationScreen
2. User logs in without verification → EmailVerificationScreen
3. User verifies email → HomeScreen access granted
4. Google users → Immediate access (pre-verified by Google)

#### 3. Google OAuth Integration

**Implementation** (`useGoogleAuth.ts`):
- Google Sign-In using Firebase Web SDK
- Automatic profile creation in backend
- Seamless authentication flow

**Backend Endpoint** (`index.js:129-172`):
```javascript
POST /api/users/social-auth
- Creates profile if doesn't exist
- Returns existing profile if already registered
- Tracks provider type ('google')
```

#### 4. Account Linking

**Feature**: Allow Google users to add email/password authentication to their account.

**Use Case**: User wants to sign in with password even though they originally used Google.

**Implementation** (`ProfileScreen.tsx`):
```typescript
const handleLinkPassword = async () => {
  const result = await firebaseService.linkEmailPassword(
    currentUser.email,
    password
  );

  if (result.success) {
    // Password added successfully
    // User can now sign in with either Google OR email/password
  }
};
```

**Backend Logic** (`firebase.ts:85-109`):
```typescript
async linkEmailPassword(email, password) {
  const user = getCurrentUser();
  const credential = EmailAuthProvider.credential(email, password);
  await linkWithCredential(user, credential);
  await sendEmailVerification(user);
  return {success: true};
}
```

### Authentication Architecture

```
┌─────────────────────────────────────────────────┐
│           Firebase Authentication               │
│  (Email/Password + Google OAuth)                │
└──────────────────┬──────────────────────────────┘
                   │
                   ├─── Email Verification Check
                   │
                   ▼
         ┌──────────────────┐
         │  AppNavigator    │
         │  Auth Guard      │
         └────────┬─────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
    Verified            Unverified
        │                    │
        ▼                    ▼
   HomeScreen      EmailVerificationScreen
```

---

## Backend Infrastructure

### Technology Stack

**Server**:
- Node.js v20.20.0
- Express.js v4.18.2
- PM2 process manager

**Database**:
- Firebase Firestore (NoSQL)

**Hosting**:
- VPS at 76.13.41.99
- Domain: digitalcoffee.cafe
- Cloudflare CDN/Proxy

### API Endpoints

#### User Management

**POST** `/api/users/register`
- Creates user profile in Firestore
- Requires Firebase auth token
- Body: `{email, name}`

**POST** `/api/users/social-auth`
- Syncs Google/social auth users to database
- Creates profile if doesn't exist
- Body: `{email, name, provider}`

**GET** `/api/users/profile`
- Fetches user profile
- **Auto-creates profile if missing** (fallback mechanism)
- Returns user data and statistics

#### Session Tracking

**POST** `/api/sessions/start`
- Starts a listening session
- Tracks: trackId, waveType, startTime
- Body: `{trackId, waveType}`

**POST** `/api/sessions/:sessionId/end`
- Ends session and updates statistics
- Updates user stats: totalSessions, totalMinutes, wave-specific counts
- Body: `{duration, completed}`

**GET** `/api/sessions`
- Retrieves user's session history
- Returns last 50 sessions, sorted by date

#### Audio Tracks

**GET** `/api/audio/tracks`
- Returns available audio tracks
- Organized by wave type (alpha/beta)

#### Email Service

**POST** `/api/email/test`
- Sends test email to authenticated user
- Verifies SMTP configuration

**POST** `/api/email/welcome`
- Sends welcome email
- Body: `{email, name}` (optional, uses auth user if not provided)

### Database Schema

**Users Collection** (`/users/{userId}`):
```javascript
{
  email: string,
  name: string,
  provider: 'email' | 'google' | 'apple',
  createdAt: Timestamp,
  stats: {
    totalSessions: number,
    totalMinutes: number,
    alphaSessions: number,
    betaSessions: number,
    currentStreak: number,
    longestStreak: number
  }
}
```

**Sessions Collection** (`/sessions/{sessionId}`):
```javascript
{
  userId: string,
  trackId: string,
  waveType: 'alpha' | 'beta',
  startTime: Timestamp,
  endTime: Timestamp | null,
  duration: number, // seconds
  completed: boolean
}
```

### Auto-Recovery Mechanisms

**Problem**: Users could get stuck if profile creation failed during registration.

**Solution** (`index.js:175-214`):
```javascript
// GET /api/users/profile
if (!userDoc.exists) {
  // Auto-create profile from Firebase Auth data
  const newProfile = {
    email: req.user.email || 'unknown@email.com',
    name: req.user.name || req.user.displayName ||
          req.user.email?.split('@')[0] || 'User',
    provider: req.user.firebase?.sign_in_provider || 'email',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    stats: { /* default stats */ }
  };

  await db.collection('users').doc(req.user.uid).set(newProfile);
  return res.json(newProfile);
}
```

**Benefits**:
- Prevents "User not found" errors
- Self-healing system
- No manual intervention required
- Seamless user experience

---

## Email Service Integration

### SMTP Configuration

**Email Provider**: PrivateEmail (Namecheap)

**Credentials**:
```
Host: mail.privateemail.com
Port: 587 (TLS)
User: abbaabdouraman@digitalcoffee.cafe
From: noreply@digitalcoffee.cafe
```

**Why PrivateEmail**:
- Professional email hosting
- Custom domain email addresses
- Reliable SMTP service
- Integrated with domain registration

### Implementation Journey

#### Challenge 1: Nodemailer Import Error

**Error**: `TypeError: nodemailer.createTransporter is not a function`

**Investigation**:
```javascript
// Testing revealed the actual function name
console.log(Object.keys(nodemailer));
// Output: ['createTransport', 'createTestAccount', 'getTestMessageUrl']
```

**Root Cause**: Documentation typo - function is `createTransport`, not `createTransporter`

**Fix**:
```javascript
// ❌ Wrong
const transporter = nodemailer.createTransporter({...});

// ✓ Correct
const transporter = nodemailer.createTransport({...});
```

#### Challenge 2: DNS Resolution

**Initial Configuration**:
```
SMTP_HOST=mail.digitalcoffee.cafe
```

**Error**: `getaddrinfo ENOTFOUND mail.digitalcoffee.cafe`

**Investigation**:
- Checked email hosting DNS records
- Found MX records pointing to: `mx1.privateemail.com`, `mx2.privateemail.com`
- Identified PrivateEmail as the email provider

**Solution**:
```
SMTP_HOST=mail.privateemail.com  ✓ Correct hostname
```

### Email Service Features

**Email Templates** (`services/emailService.js`):

1. **Welcome Email**
   - Professional HTML design
   - Branded with Digital Coffee theme
   - Explains app features (Alpha/Beta waves)
   - Call-to-action button

2. **Test Email**
   - Verifies SMTP configuration
   - Shows connection success
   - Includes timestamp and from address

3. **Notification Email**
   - Generic template for various notifications
   - Customizable subject and message
   - Consistent branding

**Example Welcome Email**:
```javascript
{
  from: '"Digital Coffee" <noreply@digitalcoffee.cafe>',
  to: 'user@example.com',
  subject: 'Welcome to Digital Coffee! ☕',
  html: `
    <div style="background: linear-gradient(135deg, #6B4423 0%, #3D2817 100%);">
      <h1>Welcome to Digital Coffee!</h1>
    </div>
    <div>
      <h2>Hello ${name}! ☕</h2>
      <p>Thank you for joining Digital Coffee...</p>

      <h3>What's Next?</h3>
      <ul>
        <li><strong>Alpha Waves (8-12 Hz):</strong> Perfect for creativity...</li>
        <li><strong>Beta Waves (12-30 Hz):</strong> Ideal for focus...</li>
      </ul>

      <a href="https://digitalcoffee.cafe">Get Started</a>
    </div>
  `
}
```

### SMTP Verification

**Connection Status**: ✅ Connected

**Log Output**:
```
SMTP server ready to send emails
```

**Test Results**:
- Connection to mail.privateemail.com:587 successful
- TLS encryption working
- Authentication successful

---

## Current Features

### User Features

1. **Multiple Sign-In Methods**
   - Email/Password registration and login
   - Google OAuth (one-tap sign-in)
   - Account linking (add password to Google account)

2. **Email Verification**
   - Required for email/password users
   - Resend verification with cooldown
   - Helpful troubleshooting tips
   - Google users bypass (pre-verified)

3. **Profile Management**
   - View authentication methods
   - Add email/password to Google accounts
   - View usage statistics
   - Sign out functionality

4. **Binaural Beat Sessions**
   - Alpha wave tracks (creativity, relaxation)
   - Beta wave tracks (focus, alertness)
   - Session tracking and history
   - Usage statistics

### Developer Features

1. **Auto-Recovery Systems**
   - Automatic profile creation on first load
   - Fallback mechanisms for missing data
   - Self-healing architecture

2. **Comprehensive Logging**
   - Backend request logging
   - Error tracking
   - Authentication flow logging
   - SMTP connection monitoring

3. **Email System**
   - Welcome emails for new users
   - Test email endpoint for debugging
   - Professional email templates
   - Branded communications

---

## Technical Architecture

### Mobile App Structure

```
/mobile-expo/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── EmailVerificationScreen.tsx
│   │   └── main/
│   │       ├── HomeScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── services/
│   │   ├── firebase.ts        # Firebase auth
│   │   └── api.ts             # Backend API client
│   ├── hooks/
│   │   └── useGoogleAuth.ts   # Google OAuth hook
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigation + auth guard
│   ├── theme/
│   │   └── index.ts           # Design system
│   └── types/
│       └── index.ts           # TypeScript definitions
├── app.json                   # Expo configuration
└── package.json
```

### Backend Structure

```
/
├── index.js                   # Main server file
├── services/
│   └── emailService.js        # SMTP email service
├── config/
│   ├── firebase.js            # Firebase Admin setup
│   └── firebase-service-account.json
├── .env                       # Environment variables
├── package.json
└── DEPLOYMENT_GUIDE.md        # Deployment instructions
```

### Data Flow

```
┌──────────────┐
│  Mobile App  │
└──────┬───────┘
       │ Firebase Web SDK
       ▼
┌──────────────────┐
│  Firebase Auth   │ ◄─── Email Verification
└──────┬───────────┘
       │ ID Token
       ▼
┌──────────────────┐
│  Backend API     │
│  (Express.js)    │
└──────┬───────────┘
       │
       ├──► Firebase Firestore (User profiles, sessions)
       │
       └──► SMTP Service (Email notifications)
```

### Authentication Flow

```
Registration (Email/Password):
1. User fills form → RegisterScreen
2. Client validates input
3. Firebase.signUp(email, password)
4. API.register(email, name) → Creates Firestore profile
5. Firebase sends verification email
6. Navigate to EmailVerificationScreen
7. User clicks verification link in email
8. User taps "I've Verified" button
9. App checks verification status
10. If verified → HomeScreen
11. If not verified → Stay on EmailVerificationScreen

Login (Email/Password):
1. User enters credentials → LoginScreen
2. Firebase.signIn(email, password)
3. Check emailVerified status
4. If verified → HomeScreen
5. If not verified → EmailVerificationScreen

Login (Google):
1. User taps Google button
2. Google OAuth flow (Firebase)
3. API.socialAuthSync() → Creates/fetches profile
4. Immediate access → HomeScreen (Google pre-verifies email)
```

---

## Deployment

### Current Infrastructure

**VPS Details**:
- IP: 76.13.41.99
- Domain: digitalcoffee.cafe
- OS: Linux
- Node.js: v20.20.0
- Process Manager: PM2

**Cloudflare Configuration**:
- CDN enabled
- DNS management
- SSL/TLS encryption
- DDoS protection

### Deployment Process

**1. Local Development**:
```bash
# Mobile app
cd mobile-expo
npm install
npx expo start --ios

# Backend
cd /path/to/backend
npm install
node index.js
```

**2. Backend Deployment**:
```bash
# Connect to VPS
ssh root@76.13.41.99

# Navigate to project
cd /var/www/digitalcoffee

# Install dependencies
npm install

# Start with PM2
pm2 start index.js --name digitalcoffee

# View logs
pm2 logs digitalcoffee

# Restart after changes
pm2 restart digitalcoffee
```

**3. Mobile App Deployment**:
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Publish update (OTA)
eas update --branch production
```

### Environment Variables

**Backend `.env`**:
```bash
# Server
PORT=3001

# SMTP Email
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@digitalcoffee.cafe
SMTP_PASS=your-smtp-password-here
SMTP_FROM_NAME=Digital Coffee
SMTP_FROM_EMAIL=noreply@digitalcoffee.cafe
```

**Firebase Config** (`mobile-expo/src/services/firebase.ts`):
```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "digitalcoffee-....firebaseapp.com",
  projectId: "digitalcoffee-...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### Monitoring

**PM2 Commands**:
```bash
pm2 status                    # Check process status
pm2 logs digitalcoffee        # View live logs
pm2 restart digitalcoffee     # Restart server
pm2 stop digitalcoffee        # Stop server
pm2 delete digitalcoffee      # Remove from PM2
```

**Health Checks**:
```bash
# API health
curl https://digitalcoffee.cafe/api/test

# SMTP status
# Check logs for: "SMTP server ready to send emails"
pm2 logs digitalcoffee --lines 50
```

---

## Achievements Summary

### Technical Accomplishments

1. ✅ **Migrated from React Native to Expo**
   - Simplified development workflow
   - Improved developer experience
   - Faster iteration cycles

2. ✅ **Complete Authentication System**
   - Email/password with verification
   - Google OAuth integration
   - Account linking functionality
   - Secure auth guards

3. ✅ **Email Verification Flow**
   - Dedicated verification screen
   - Resend functionality with spam prevention
   - Proper user routing

4. ✅ **Backend API**
   - RESTful endpoints
   - Firebase Firestore integration
   - Session tracking
   - Auto-recovery mechanisms

5. ✅ **SMTP Email Service**
   - Professional email templates
   - Reliable delivery (PrivateEmail)
   - Multiple email types (welcome, test, notifications)

6. ✅ **Production Deployment**
   - VPS hosting with PM2
   - Cloudflare CDN
   - SSL/TLS encryption
   - Monitoring and logging

### User Experience Improvements

1. **Seamless Authentication**
   - Multiple sign-in options
   - Clear error messages
   - Helpful verification flow

2. **Self-Healing System**
   - Automatic profile creation
   - Recovery from registration failures
   - No manual intervention needed

3. **Professional Communications**
   - Branded welcome emails
   - Clear verification instructions
   - Consistent messaging

4. **Secure by Default**
   - Email verification required
   - Firebase security rules
   - Token-based API authentication

---

## Future Enhancements

### Planned Features

1. **Push Notifications**
   - Session reminders
   - Streak maintenance alerts
   - New track announcements

2. **Advanced Analytics**
   - Usage patterns
   - Progress tracking
   - Personalized recommendations

3. **Social Features**
   - Share achievements
   - Community challenges
   - Leaderboards

4. **Premium Content**
   - Exclusive tracks
   - Longer sessions
   - Custom wave frequencies

5. **Offline Support**
   - Download tracks
   - Offline session tracking
   - Sync when online

### Technical Improvements

1. **Enhanced Email Service**
   - Email templates for all user actions
   - Automated marketing emails
   - Transaction emails

2. **Better Error Handling**
   - Sentry integration
   - User-friendly error messages
   - Automatic error reporting

3. **Performance Optimization**
   - Image optimization
   - Audio streaming
   - Cache management

4. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests

---

## Lessons Learned

### Technology Choices

1. **Expo vs React Native CLI**
   - Expo's managed workflow significantly reduced complexity
   - Firebase Web SDK integration was smoother than native modules
   - Trade-off: Less control over native code, but worth it for this project

2. **Firebase Firestore**
   - NoSQL structure perfect for user profiles and sessions
   - Real-time capabilities (not yet utilized)
   - Good SDK support

3. **VPS vs Serverless**
   - VPS gives full control
   - PM2 provides easy process management
   - Cost-effective for current scale

### Development Process

1. **Auto-Recovery is Essential**
   - Users will find edge cases
   - Systems should self-heal when possible
   - Fallback mechanisms prevent support tickets

2. **Email Service Debugging**
   - Always test SMTP locally first
   - DNS issues are common
   - Keep credentials secure but accessible for debugging

3. **Authentication is Complex**
   - Multiple sign-in methods require careful coordination
   - Email verification is crucial for security
   - Account linking adds value but increases complexity

### Best Practices Established

1. **Error Handling**
   - Log everything on backend
   - User-friendly messages on frontend
   - Automatic recovery where possible

2. **Code Organization**
   - Clear separation of concerns
   - Reusable components and services
   - Type-safe with TypeScript

3. **Deployment**
   - Document deployment steps
   - Use environment variables
   - Monitor production logs

---

## Conclusion

Digital Coffee has evolved from a basic React Native app to a robust Expo-based mobile application with a complete authentication system, backend API, and professional email service. The migration to Expo significantly improved development velocity and reduced complexity, while the comprehensive authentication system ensures security and user account recovery.

The project demonstrates:
- **Technical Excellence**: Clean architecture, type safety, error handling
- **User-Centric Design**: Self-healing systems, clear messaging, multiple auth options
- **Production Ready**: Deployed infrastructure, monitoring, documentation
- **Scalability**: Modular design, cloud services, room for growth

With the foundation solidly in place, Digital Coffee is ready for user acquisition and feature expansion.

---

**Last Updated**: February 25, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
