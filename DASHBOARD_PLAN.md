# Digital Coffee - Admin Dashboard Comprehensive Plan

## Current State Analysis

### Backend API Endpoints Available:
1. **User Management** (`/api/admin/users`)
   - GET `/api/admin/users` - List all users with filters (status, premium, subscription)
   - GET `/api/admin/users/:userId` - Get specific user details
   - POST `/api/admin/users/:userId/grant-premium` - Grant premium access
   - POST `/api/admin/users/:userId/ban` - Ban user
   - POST `/api/admin/users/:userId/unban` - Unban user
   - DELETE `/api/admin/users/:userId` - Delete user

2. **Audio Track Management** (`/api/admin/audio`)
   - GET `/api/audio/tracks` - List all tracks
   - POST `/api/admin/audio/upload` - Upload new audio file
   - DELETE `/api/admin/audio/:trackId` - Delete track

3. **Statistics** (`/api/admin/stats`)
   - GET `/api/admin/stats` - Get comprehensive statistics
   - Returns: total users, active users, total sessions, sessions today, total listening time, avg session time, premium users, etc.

4. **Sessions** (`/api/sessions`)
   - GET `/api/sessions` - List user sessions
   - Sessions include: trackId, waveType, duration, completed, startTime, endTime

### Mobile App Features (from mobile-expo/src):
1. **User-facing Features:**
   - Authentication (Email/Password, Google Sign-in)
   - Audio track playback (Alpha & Beta waves)
   - Session tracking with streaks
   - User profile management
   - Subscription/Paywall system
   - Settings (notifications, audio quality, dark mode, etc.)
   - Help/Support form

2. **Data Submitted by App:**
   - **Help/Feedback**: Via SettingsScreen.tsx -> HelpScreen.tsx (Contact Support section)
     - Currently opens mailto links (need backend endpoint)
   - **Session Data**: Automatically tracked
   - **User Preferences**: Stored in AsyncStorage (need sync endpoint)

## Missing Backend Endpoints (Need to Add):

1. **Feedback/Support System:**
   - POST `/api/admin/feedback` - Submit feedback/support ticket
   - GET `/api/admin/feedback` - List all feedback submissions
   - PATCH `/api/admin/feedback/:id` - Update feedback status (pending/resolved/closed)
   - GET `/api/admin/feedback/:id` - Get specific feedback details

2. **Notifications/Push:**
   - GET `/api/admin/notifications` - List sent notifications
   - POST `/api/admin/notifications/send` - Send push notification to users
   - GET `/api/admin/notifications/stats` - Notification delivery stats

## Dashboard Pages to Build:

### 1. **Overview/Dashboard** (Main Page)
**Route:** `/admin` or `/admin/dashboard`
**Components:**
- **Stats Cards (Top Row):**
  - Total Users
  - Active Users (Today)
  - Total Sessions
  - Total Revenue (placeholder for future)

- **Charts:**
  - User Growth Chart (Line chart - users over time)
  - Session Activity Chart (Bar chart - sessions per day)
  - Wave Type Distribution (Pie chart - Alpha vs Beta usage)

- **Recent Activity Feed:**
  - Latest user registrations
  - Latest sessions
  - Recent feedback submissions

- **Quick Actions:**
  - Upload New Track
  - View All Users
  - Check Pending Feedback

**API Calls:**
- GET `/api/admin/stats`
- GET `/api/admin/users?limit=5&sort=createdAt`
- GET `/api/sessions?limit=10&sort=startTime`

---

### 2. **User Management Page**
**Route:** `/admin/users`
**Features:**
- **User List Table:**
  - Columns: Avatar, Name, Email, Status, Subscription, Sessions Count, Last Active, Actions
  - Sortable by all columns
  - Filters: Status (active/banned), Subscription (free/premium), Date range
  - Search by name/email
  - Pagination (20 users per page)

- **User Actions (Dropdown):**
  - View Details
  - Grant Premium
  - Ban/Unban User
  - Delete User
  - Send Notification

- **User Details Modal:**
  - Full user profile
  - Session history (with graph)
  - Subscription details
  - Account actions

**API Calls:**
- GET `/api/admin/users?page=1&limit=20&status=active&premium=all`
- GET `/api/admin/users/:userId`
- POST `/api/admin/users/:userId/grant-premium`
- POST `/api/admin/users/:userId/ban`
- DELETE `/api/admin/users/:userId`

---

### 3. **Audio Tracks Management Page**
**Route:** `/admin/tracks`
**Features:**
- **Track List (Grid or Table View):**
  - Track Name
  - Wave Type (Alpha/Beta)
  - Duration
  - Frequency
  - Category
  - Premium Status
  - Play Count (from sessions)
  - Actions

- **Audio Player (Inline):**
  - Play/pause audio directly in dashboard
  - Waveform visualization
  - Volume control
  - Current time / Total duration

- **Upload New Track:**
  - Form with fields:
    - Name
    - Description
    - Wave Type (Alpha/Beta)
    - Frequency (Hz)
    - Category (dropdown)
    - Tags (multi-select)
    - Premium (checkbox)
    - Audio File (drag & drop upload)
  - Preview audio before saving
  - Upload progress indicator

- **Edit Track:**
  - Modify all track metadata
  - Replace audio file
  - View usage statistics

- **Delete Track:**
  - Confirmation modal
  - Warning if track has active users

**API Calls:**
- GET `/api/audio/tracks`
- POST `/api/admin/audio/upload`
- PATCH `/api/admin/audio/:trackId` (need to add)
- DELETE `/api/admin/audio/:trackId`
- GET `/api/admin/audio/:trackId/stats` (need to add)

---

### 4. **Help/Feedback Management Page**
**Route:** `/admin/feedback`
**Features:**
- **Feedback List:**
  - Columns: User, Subject, Status, Priority, Date, Actions
  - Filters: Status (pending/in-progress/resolved/closed), Priority (low/medium/high)
  - Search by user email or subject
  - Sort by date, status, priority

- **Feedback Details Modal:**
  - Full feedback message
  - User information
  - Submission date
  - Response history
  - Respond to user (send email)
  - Change status
  - Assign priority

- **Stats:**
  - Total feedback submissions
  - Pending items
  - Average response time
  - Satisfaction rating (if implemented)

**API Calls (Need to Create):**
- POST `/api/feedback/submit` (for mobile app)
- GET `/api/admin/feedback?status=pending&page=1`
- GET `/api/admin/feedback/:id`
- PATCH `/api/admin/feedback/:id` (update status, add response)
- POST `/api/admin/feedback/:id/respond` (send email to user)

---

### 5. **Subscription/Revenue Monitor Page**
**Route:** `/admin/subscriptions`
**Features:**
- **Revenue Overview:**
  - Total Revenue (Monthly/Annual)
  - Active Subscriptions Count
  - New Subscriptions This Month
  - Churn Rate
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)

- **Subscription List:**
  - User Name & Email
  - Plan Type (Monthly/Annual)
  - Status (Active/Cancelled/Expired)
  - Start Date
  - Renewal Date
  - Amount
  - Payment Method

- **Charts:**
  - Revenue over time (line chart)
  - Subscriptions by plan type (pie chart)
  - Churn rate over time

- **Subscription Actions:**
  - Manually grant premium
  - Cancel subscription
  - Refund subscription
  - Extend subscription

**API Calls (Need to Create):**
- GET `/api/admin/subscriptions?status=active&page=1`
- GET `/api/admin/subscriptions/stats`
- GET `/api/admin/subscriptions/:id`
- POST `/api/admin/subscriptions/:id/cancel`
- POST `/api/admin/subscriptions/:id/extend`

**Note:** Currently premium is manually granted. Need to integrate with payment provider (Stripe/RevenueCat) for real subscription management.

---

### 6. **Analytics Page**
**Route:** `/admin/analytics`
**Features:**
- **Usage Analytics:**
  - Total Sessions
  - Total Listening Time
  - Average Session Duration
  - Peak Usage Hours (heatmap)
  - Most Popular Tracks
  - Wave Type Preferences

- **User Engagement:**
  - Daily Active Users (DAU)
  - Weekly Active Users (WAU)
  - Monthly Active Users (MAU)
  - Retention Rate
  - Session Frequency
  - Streak Distribution

- **Charts:**
  - Sessions over time
  - User engagement funnel
  - Track popularity
  - Wave type usage by time of day

**API Calls:**
- GET `/api/admin/analytics/usage`
- GET `/api/admin/analytics/engagement`
- GET `/api/admin/analytics/tracks`
- GET `/api/sessions?startDate=xxx&endDate=xxx`

---

### 7. **Settings Page**
**Route:** `/admin/settings`
**Features:**
- **Admin Account:**
  - Change password
  - Update profile
  - Two-factor authentication

- **App Settings:**
  - Default track settings
  - Feature flags (enable/disable features)
  - Maintenance mode

- **Notifications:**
  - Email templates
  - Push notification settings
  - SMTP configuration

- **API Keys:**
  - Firebase config
  - Payment provider keys
  - Analytics keys

---

## Technical Implementation Plan:

### Phase 1: Backend Endpoints (Priority)
1. Create feedback/support system endpoints
2. Add track update/edit endpoint
3. Add subscription management endpoints
4. Add analytics aggregation endpoints
5. Add notification management endpoints

### Phase 2: Dashboard UI Components
1. Build reusable components:
   - DataTable component (with sort, filter, pagination)
   - StatsCard component
   - Chart components (using recharts or chart.js)
   - Modal component
   - AudioPlayer component
   - Form components
   - Action dropdown component

### Phase 3: Dashboard Pages (Build in Order)
1. Overview/Dashboard (Main page)
2. User Management
3. Audio Tracks Management
4. Help/Feedback Management
5. Analytics
6. Subscriptions
7. Settings

### Phase 4: Testing & Polish
1. Test all CRUD operations
2. Test audio playback
3. Add loading states
4. Add error handling
5. Add success notifications
6. Responsive design
7. Dark mode support

---

## Tech Stack for Dashboard:

**Current:**
- React (from admin-dashboard/)
- Vite
- TypeScript
- Firebase SDK

**Need to Add:**
- **UI Framework:** Tailwind CSS or Material-UI
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table (react-table)
- **Forms:** React Hook Form
- **State Management:** React Query for API calls
- **Audio Player:** react-h5-audio-player or Howler.js
- **Notifications:** react-hot-toast or sonner
- **Icons:** Heroicons or Lucide React

---

## Immediate Next Steps:

1. ✅ SSL Certificate fixed
2. ✅ Audio files downloaded and seeded
3. ⏳ Verify audio files are accessible
4. 🔲 Install necessary npm packages for dashboard
5. 🔲 Create feedback system backend endpoints
6. 🔲 Build Dashboard Layout with Navigation
7. 🔲 Build Overview Page
8. 🔲 Build User Management Page
9. 🔲 Build Audio Tracks Management Page
10. 🔲 Build Feedback Management Page

---

## File Structure for Dashboard:

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── common/
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── Heatmap.tsx
│   │   ├── audio/
│   │   │   ├── AudioPlayer.tsx
│   │   │   └── Waveform.tsx
│   │   └── users/
│   │       ├── UserTable.tsx
│   │       ├── UserModal.tsx
│   │       └── UserActions.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Tracks.tsx
│   │   ├── Feedback.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── firebase.ts
│   ├── hooks/
│   │   ├── useUsers.ts
│   │   ├── useTracks.ts
│   │   ├── useFeedback.ts
│   │   └── useStats.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
```
