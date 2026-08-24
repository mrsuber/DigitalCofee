# Digital Coffee - Testing Guide

## Current Status

### ✅ Completed
1. **Admin Dashboard** - Fully deployed at https://digitalcoffee.cafe/admin
2. **Admin Authentication** - Admin user created with full privileges
3. **Mobile Feedback Feature** - Complete feedback submission UI implemented
4. **Backend API** - Running with feedback endpoints

### 🚀 Ready to Test
- Mobile app feedback submission
- Admin dashboard feedback management
- Audio track playback

## Test Scenarios

### 1. Mobile App Feedback Submission

**Prerequisites:**
- Mobile app running (Expo or React Native)
- Backend server running (localhost:3001 or VPS)
- User logged in to mobile app

**Steps:**
1. Open mobile app
2. Navigate to Profile tab
3. Tap "Feedback & Support" button
4. Select a category (General, Bug, Feature, Help)
5. Enter subject and message
6. Tap "Submit Feedback"
7. Verify success message appears

**Expected Results:**
- Feedback submission succeeds
- Success alert displayed
- User returned to profile screen
- Feedback stored in Firestore `feedback` collection

### 2. Admin Dashboard Feedback Review

**Prerequisites:**
- Admin logged in at https://digitalcoffee.cafe/admin/login
- At least one feedback submission in database

**Steps:**
1. Log in with admin credentials:
   - Email: `admin@digitalcoffee.cafe`
   - Password: `admin123456`
2. Navigate to "Feedback" page
3. View list of feedback submissions
4. Click on a feedback item to view details
5. Update status (pending → in-progress → resolved)
6. Add admin response

**Expected Results:**
- All feedback items displayed in table
- Filtering by category works
- Status updates persist
- Admin responses saved

### 3. Audio Track Playback

**Prerequisites:**
- 8 audio tracks seeded on VPS
- Mobile app with player functionality
- User logged in

**Steps:**
1. Open mobile app
2. Navigate to Home tab
3. Select Alpha or Beta wave type
4. Choose a track to play
5. Test play/pause controls
6. Test progress tracking
7. Complete a session

**Expected Results:**
- Track loads and plays
- Controls work correctly
- Session tracked in database
- Stats updated on profile

## API Endpoints to Test

### Feedback Endpoints

**Submit Feedback:**
```bash
curl -X POST https://digitalcoffee.cafe/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject": "Test Feedback",
    "message": "This is a test feedback message",
    "category": "general",
    "priority": "medium"
  }'
```

**Get All Feedback (Admin):**
```bash
curl -X GET https://digitalcoffee.cafe/api/feedback/all \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Update Feedback Status (Admin):**
```bash
curl -X PUT https://digitalcoffee.cafe/api/feedback/FEEDBACK_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "resolved",
    "adminResponse": "Thank you for your feedback!"
  }'
```

### Audio Endpoints

**Get Tracks:**
```bash
curl -X GET https://digitalcoffee.cafe/api/audio/tracks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Session Endpoints

**Start Session:**
```bash
curl -X POST https://digitalcoffee.cafe/api/sessions/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trackId": "TRACK_ID",
    "waveType": "alpha"
  }'
```

**End Session:**
```bash
curl -X POST https://digitalcoffee.cafe/api/sessions/SESSION_ID/end \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "duration": 600,
    "completed": true
  }'
```

## Known Issues

### Firebase Indexes
The backend requires Firestore composite indexes for:
- Sessions queries (userId + startTime)
- Streak history queries (completed + userId + startTime)

**Solution:** Click the index creation links in the error messages or create them manually in Firebase Console.

### SMTP Authentication
Email notifications may not work if SMTP credentials are invalid.

**Solution:** Update SMTP settings in `.env` file or disable email notifications.

## Environment Setup

### Local Development

**Backend:**
```bash
cd /Users/camsoltechnology/dev/camsol_company/divisionalOfficer/DigitalCofee
npm start
```

**Mobile App (Expo):**
```bash
cd /Users/camsoltechnology/dev/camsol_company/divisionalOfficer/DigitalCofee/mobile
npx expo start
```

**Admin Dashboard:**
```bash
cd /Users/camsoltechnology/dev/camsol_company/divisionalOfficer/DigitalCofee/admin-dashboard
npm run dev
```

### Production URLs

- **API:** https://digitalcoffee.cafe/api
- **Admin:** https://digitalcoffee.cafe/admin
- **Audio CDN:** https://digitalcoffee.cafe/audio

## Test Data

### Admin User
- Email: `admin@digitalcoffee.cafe`
- Password: `admin123456`
- UID: `vt0h1IZOFBM7XsYdNUmHuymuBTH3`

### Audio Tracks

**Alpha Waves (8-13 Hz):**
1. Morning Creative Flow
2. Deep Meditation
3. Creative Breakthrough
4. Relaxed Focus

**Beta Waves (13-30 Hz):**
1. Productive Focus
2. Active Concentration
3. Study Power
4. Mental Energy

## Success Criteria

✅ **Mobile Feedback Submission:**
- User can submit feedback from mobile app
- Form validation works correctly
- Success/error messages display properly
- Network errors handled gracefully

✅ **Admin Dashboard:**
- Admin can log in successfully
- All feedback items visible
- Status updates work
- Admin responses persist

✅ **Audio Playback:**
- Tracks load and play correctly
- Controls respond properly
- Sessions tracked accurately
- Stats update on profile

## Next Steps

1. **Test Feedback Flow:**
   - Submit feedback from mobile app
   - Verify it appears in admin dashboard
   - Update status and add response
   - Confirm changes persist

2. **Test Audio System:**
   - Play alpha wave tracks
   - Play beta wave tracks
   - Complete full sessions
   - Verify stats update

3. **User Registration:**
   - Test new user signup
   - Verify email verification
   - Check welcome email
   - Test first-time user flow

4. **Subscription System:**
   - Implement upgrade flow
   - Test payment processing
   - Verify access controls
   - Test subscription status

## Support

For issues or questions:
- Check logs in backend server
- Review Firebase console for data
- Check browser console for frontend errors
- Contact support@digitalcoffee.cafe
