# Digital Coffee - Admin Dashboard Specification

## Table of Contents
1. [Dashboard Overview](#dashboard-overview)
2. [Technology Stack](#technology-stack)
3. [Dashboard Structure](#dashboard-structure)
4. [Page-by-Page Specifications](#page-by-page-specifications)
5. [Components Library](#components-library)
6. [API Endpoints](#api-endpoints)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Design System](#design-system)

---

## Dashboard Overview

The Admin Dashboard is a web-based control center for managing Digital Coffee. It provides real-time analytics, user management, content management, and business operations tools.

**Primary Users:**
- Super Admins (founders, developers)
- Content Managers (audio upload/curation)
- Support Agents (customer support)
- Analysts (business intelligence)
- Marketing Team (campaigns, notifications)

**Key Goals:**
- Monitor app health and user engagement
- Manage users and subscriptions
- Upload and organize audio content
- Track revenue and business metrics
- Communicate with users
- Provide customer support

**Access URL:**
- Production: https://digitalcoffee.cafe/admin
- Local: http://localhost:5173/admin

---

## Technology Stack

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Library:** Tailwind CSS
- **Charts/Graphs:** Recharts or Chart.js
- **Date Handling:** date-fns
- **HTTP Client:** Axios
- **State Management:** React Context API + React Query
- **Routing:** React Router v6
- **Form Handling:** React Hook Form
- **Icons:** Lucide React
- **Tables:** TanStack Table (React Table v8)
- **Notifications:** React Hot Toast

### Backend (Shared with Mobile App)
- **Runtime:** Node.js + Express
- **Database:** Firestore
- **Storage:** Firebase Storage
- **Authentication:** Firebase Auth (Admin SDK)
- **Payments:** Stripe
- **Email:** SendGrid or AWS SES

### Hosting
- **Frontend:** Vercel or Firebase Hosting
- **Backend:** Railway, Render, or Firebase Functions

---

## Dashboard Structure

### Main Navigation (Sidebar)

```
┌─────────────────────────────────────┐
│  Digital Coffee Admin               │
├─────────────────────────────────────┤
│  📊 Overview                         │
│  👥 Users                            │
│     ├─ All Users                    │
│     ├─ Active Users                 │
│     ├─ Premium Users                │
│     └─ Power Users                  │
│  🎵 Audio                            │
│     ├─ All Tracks                   │
│     ├─ Upload Track                 │
│     ├─ Collections                  │
│     └─ Track Analytics              │
│  💳 Subscriptions                    │
│     ├─ Active Subscriptions         │
│     ├─ Revenue                      │
│     ├─ Promo Codes                  │
│     └─ Failed Payments              │
│  📈 Analytics                        │
│     ├─ Engagement                   │
│     ├─ Retention                    │
│     ├─ Conversion Funnel            │
│     └─ Wave Performance             │
│  📣 Marketing                        │
│     ├─ Notifications                │
│     ├─ Email Campaigns              │
│     └─ In-App Messages              │
│  🎫 Support                          │
│     ├─ Tickets                      │
│     └─ FAQ Manager                  │
│  📄 Reports                          │
│  ⚙️ Settings                         │
│     ├─ App Settings                 │
│     ├─ Payment Settings             │
│     └─ Team Management              │
└─────────────────────────────────────┘
```

---

## Page-by-Page Specifications

---

## 1. OVERVIEW / DASHBOARD HOME

### Purpose
First screen admins see - high-level snapshot of app health and business metrics.

### Layout

#### Top Section: Key Metrics Cards (Grid: 4 columns on desktop, 2 on tablet, 1 on mobile)

**Card 1: Total Users**
- Large number: Total registered users
- Trend indicator: ↑ 12% vs last month
- Small graph: 7-day sparkline
- Click → Navigate to Users page

**Card 2: Active Users**
- Large number: Active users (used app in last 7 days)
- Percentage of total users
- Trend indicator
- Small graph: 7-day sparkline
- Click → Navigate to Active Users page

**Card 3: Total Sessions (This Month)**
- Large number: Sessions completed this month
- Comparison to last month
- Trend indicator
- Small graph: 30-day sparkline

**Card 4: Monthly Revenue (MRR)**
- Large number: $X,XXX
- Trend indicator vs last month
- Annual projection
- Small graph: 12-month trend

**Card 5: Conversion Rate**
- Large number: X.X%
- Free → Premium conversion rate
- Trend indicator
- Industry benchmark comparison

**Card 6: Active Subscriptions**
- Large number: Total active subscriptions
- Breakdown by tier (Premium/Elite)
- Trend indicator
- Click → Navigate to Subscriptions

**Card 7: Churn Rate**
- Large number: X.X%
- Cancellations this month
- Trend indicator
- Alert if > 5%

**Card 8: Avg Session Duration**
- Large number: XX min
- Trend indicator
- Comparison to target (60 min)

---

#### Middle Section: Visual Analytics

**User Growth Chart (Line Graph)**
- X-axis: Time (last 30 days, selectable: 7/30/90/365 days)
- Y-axis: Number of users
- Lines:
  - Total users (blue)
  - Active users (green)
  - Premium users (purple)
- Hover: Show exact numbers
- Zoom/pan capabilities

**Session Activity Heatmap**
- Grid: Days of week (Y) × Hours of day (X)
- Color intensity: Number of sessions
- Darker = more sessions
- Hover: Exact session count
- Insights: "Peak usage: Tuesday 10am"

**Revenue Trends (Bar Chart)**
- X-axis: Last 12 months
- Y-axis: Revenue ($)
- Bars: Monthly revenue
- Overlay line: Moving average
- Click bar → Detailed revenue breakdown

**Wave Type Popularity (Pie/Donut Chart)**
- Segments: Delta, Theta, Alpha, Beta, Gamma
- Percentages and session counts
- Colors match app branding
- Click segment → Wave-specific analytics

**Track Performance (Horizontal Bar Chart)**
- Top 10 most-played tracks
- X-axis: Number of plays
- Y-axis: Track names
- Color-coded by wave type
- Click bar → Track details page

---

#### Bottom Section: Recent Activity Feed

**Real-time Activity Stream** (Updates every 10 seconds)
- Last 20 activities
- Icons for each activity type
- Timestamp (relative: "2 minutes ago")
- Clickable to view details

**Activity Types:**
- 👤 New user signup: "Sarah Jones signed up"
- 💎 New Premium subscription: "John Doe upgraded to Premium"
- ⭐ New Elite subscription: "Jane Smith upgraded to Elite"
- ❌ Subscription cancelled: "Bob Lee cancelled Premium"
- 🔥 Streak milestone: "Alice Wong hit 30-day streak"
- 🎵 New track uploaded: "Morning Focus (Beta) uploaded"
- 🐛 Bug report: "User reported playback issue"
- 💬 Support ticket: "New ticket #1234"

**Filters:**
- All activities
- Subscriptions only
- User activities only
- System events only

---

### Technical Specs

**Data Refresh:**
- Metrics cards: Every 30 seconds (WebSocket or polling)
- Charts: On page load + manual refresh button
- Activity feed: Every 10 seconds

**Performance:**
- Lazy load charts
- Virtualized activity feed (only render visible items)
- Cache data for 30 seconds

**API Endpoints:**
- `GET /api/admin/overview/metrics` - All metric cards
- `GET /api/admin/overview/user-growth?period=30` - User growth data
- `GET /api/admin/overview/session-heatmap` - Heatmap data
- `GET /api/admin/overview/revenue-trends?period=12` - Revenue data
- `GET /api/admin/overview/wave-popularity` - Wave type data
- `GET /api/admin/overview/top-tracks?limit=10` - Top tracks
- `GET /api/admin/overview/activity-feed?limit=20` - Recent activities

---

## 2. USERS PAGE

### 2.1 All Users List

#### Purpose
Searchable, filterable table of all registered users.

#### Layout

**Header:**
- Page title: "Users"
- Total count: "Showing X of Y users"
- Search bar (searches name, email)
- Filter button
- Export button (CSV/Excel)
- Refresh button

**Filters Panel (Collapsible):**

**Subscription Tier:**
- [ ] Free
- [ ] Premium Monthly
- [ ] Premium Yearly
- [ ] Elite Monthly
- [ ] Elite Yearly
- [ ] Lifetime

**Activity:**
- [ ] Active (last 7 days)
- [ ] Moderately Active (last 30 days)
- [ ] Inactive (30+ days)
- [ ] Never Used App

**Streak:**
- [ ] 1-7 days
- [ ] 8-30 days
- [ ] 31-100 days
- [ ] 100+ days

**Total Sessions:**
- [ ] 1-10 sessions
- [ ] 11-50 sessions
- [ ] 51-100 sessions
- [ ] 100+ sessions

**Registration Date:**
- Date range picker

**Apply Filters Button**
**Clear All Filters Button**

---

**Users Table:**

Columns:
1. **Checkbox** (for bulk actions)
2. **Name** (sortable)
   - User avatar/initials
   - Full name
   - Click → User detail page
3. **Email** (sortable)
   - Email address
   - Verified badge if verified
4. **Joined** (sortable)
   - Date joined
   - Relative time ("3 months ago")
5. **Tier** (sortable, filterable)
   - Badge: Free / Premium / Elite / Lifetime
   - Color-coded
6. **Sessions** (sortable)
   - Total session count
7. **Minutes** (sortable)
   - Total listening minutes
   - Convert to hours if > 60
8. **Streak** (sortable)
   - Current streak days
   - 🔥 icon if > 7 days
9. **Last Active** (sortable)
   - Date/time of last activity
   - Relative time
   - Red if > 30 days
10. **Status** (filterable)
    - Active / Inactive / Banned
    - Status indicator dot
11. **Actions**
    - Dropdown menu:
      - View Details
      - Send Email
      - Grant Premium
      - Ban/Suspend
      - Delete

**Table Features:**
- Sortable columns (click header to sort)
- Pagination (25/50/100/500 per page)
- Column visibility toggle
- Bulk actions:
  - Send email to selected users
  - Export selected users
  - Delete selected users (with confirmation)

**Bulk Actions Bar** (appears when users selected):
- "X users selected"
- Send Email button
- Export button
- Delete button
- Deselect all

---

### 2.2 Individual User Detail Page

#### Purpose
Comprehensive view of a single user's account, activity, and subscription.

#### URL
`/admin/users/:userId`

#### Layout

**Header:**
- Back button
- User avatar (large)
- User name
- Email
- User ID
- Join date
- Action buttons:
  - Edit Profile
  - Send Email
  - Send Push Notification
  - Grant Free Access
  - Ban User
  - Delete Account

**Tab Navigation:**
1. Overview
2. Sessions
3. Subscription
4. Activity Log
5. Support Tickets

---

**Tab 1: Overview**

**Profile Information Card:**
- Full Name
- Email
- Phone (if provided)
- Join Date
- Last Active
- Account Status (Active/Inactive/Banned)
- Auth Methods (Google, Apple, Email/Password)

**Quick Stats Cards (4 columns):**
- Total Sessions
- Total Minutes
- Current Streak
- Longest Streak

**Usage Analytics:**

**Sessions Over Time (Line Chart)**
- Last 30/60/90 days
- Sessions per day
- Highlight active days

**Wave Type Preference (Pie Chart)**
- % of sessions by wave type
- Total sessions per type

**Activity Heatmap**
- When does this user listen most?
- Hour of day × Day of week

**Favorite Tracks (List)**
- Top 5 most-played tracks
- Play count per track
- Last played date

**Listening Patterns:**
- Average session length
- Best time of day (when they complete sessions)
- Completion rate
- Preferred wave types

---

**Tab 2: Sessions**

**Session History Table:**

Columns:
1. Date/Time
2. Track Name
3. Wave Type (badge)
4. Duration
5. Completed (✓ or ✗)
6. Device (iOS/Android)

**Filters:**
- Date range
- Wave type
- Completed only
- Track name search

**Pagination**

**Export Sessions Button**

---

**Tab 3: Subscription**

**Current Subscription Card:**
- Plan: Free / Premium Monthly / Premium Yearly / Elite / Lifetime
- Status: Active / Cancelled / Expired
- Started: Date
- Next Billing: Date (if active)
- Amount: $X.XX
- Actions:
  - Change Plan
  - Cancel Subscription
  - Refund
  - Extend Trial

**Subscription History Table:**
- Date
- Action (Subscribed, Upgraded, Downgraded, Cancelled, Renewed)
- Plan
- Amount
- Status

**Payment History Table:**
- Date
- Description
- Amount
- Status (Succeeded/Failed)
- Invoice (download link)

**Actions:**
- Issue Refund
- Send Invoice
- Update Payment Method

---

**Tab 4: Activity Log**

**Timeline of all user actions:**
- Account created
- First session completed
- Upgraded to Premium
- Completed 30-day streak
- Track favorited
- Subscription cancelled
- Support ticket created
- Each entry:
  - Icon
  - Action description
  - Timestamp
  - Additional details

**Filters:**
- Activity type
- Date range

---

**Tab 5: Support Tickets**

**List of all support tickets from this user:**
- Ticket ID
- Subject
- Status
- Created
- Last Updated
- Click → Open ticket

**Quick Actions:**
- Create New Ticket (on behalf of user)
- View All Tickets

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/users` - List users (with filters, pagination)
- `GET /api/admin/users/:userId` - User details
- `GET /api/admin/users/:userId/sessions` - User sessions
- `GET /api/admin/users/:userId/subscription` - Subscription details
- `GET /api/admin/users/:userId/payments` - Payment history
- `GET /api/admin/users/:userId/activity` - Activity log
- `GET /api/admin/users/:userId/tickets` - Support tickets
- `PUT /api/admin/users/:userId` - Update user
- `POST /api/admin/users/:userId/grant-premium` - Grant free access
- `POST /api/admin/users/:userId/ban` - Ban user
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/users/:userId/send-email` - Send email
- `POST /api/admin/users/:userId/send-notification` - Send push

---

## 3. AUDIO MANAGEMENT

### 3.1 All Tracks Page

#### Purpose
Manage all audio tracks - view, edit, delete, organize.

#### Layout

**Header:**
- Page title: "Audio Tracks"
- Total count: "X tracks"
- View toggle: Grid / List
- Search bar (track name)
- Filter button
- Sort dropdown (Upload Date, Name, Popularity, Duration)
- Upload New Track button (primary action)

**Filters Panel:**
- Wave Type: All / Delta / Theta / Alpha / Beta / Gamma
- Visibility: All / Free / Premium / Elite
- Featured: All / Featured Only
- Upload Date range

---

**Grid View** (Default):

Track Cards (Grid: 4 columns desktop, 3 tablet, 2 mobile)

Each Card:
- Cover art / Thumbnail
- Wave type badge (top-left corner)
- Featured star (if featured, top-right)
- Track name
- Duration
- Play count
- Upload date
- Actions menu (3 dots):
  - Edit
  - Duplicate
  - Download
  - Delete

Hover Effect:
- Show play button overlay
- Highlight card

Click Card:
- Navigate to Track Details page

---

**List View** (Alternative):

Table with columns:
1. Cover (thumbnail)
2. Track Name (sortable)
3. Wave Type (filterable, sortable)
4. Duration (sortable)
5. Plays (sortable)
6. Visibility (Free/Premium/Elite)
7. Featured (✓ or –)
8. Upload Date (sortable)
9. Actions (Edit, Delete, etc.)

---

**Pagination:**
- 20/50/100 per page
- Page numbers
- Previous/Next buttons

---

### 3.2 Upload Track Page/Modal

#### Purpose
Add new audio tracks to the library.

#### Layout Options:
- Modal (overlay) OR
- Full page (`/admin/audio/upload`)

#### Form Fields:

**1. Audio File Upload** (Required)
- Drag-and-drop zone
- "Click to browse" button
- Accepted formats: MP3, WAV, OGG, M4A
- Max file size: 100 MB
- Preview audio player after upload
- Shows: filename, file size, duration (auto-detected)
- Remove file button

**Bulk Upload Option:**
- Upload multiple files at once
- Each file creates a separate track entry
- Pre-fill wave type for all
- Bulk form below

---

**2. Track Information**

**Track Name** (Required)
- Text input
- Placeholder: "e.g., Morning Focus"
- Character limit: 100

**Wave Type** (Required)
- Dropdown select:
  - Delta Waves (0.5-4 Hz)
  - Theta Waves (4-8 Hz)
  - Alpha Waves (8-12 Hz)
  - Beta Waves (12-30 Hz)
  - Gamma Waves (30-100 Hz)

**Description** (Optional)
- Textarea
- Placeholder: "Describe this track's benefits and ideal use cases"
- Character limit: 500
- Markdown support

**Duration** (Auto-detected, Read-only)
- Automatically calculated from audio file
- Display in minutes:seconds

---

**3. Categorization**

**Tags** (Optional)
- Multi-select or tag input
- Predefined tags: morning, evening, study, sleep, work, meditation, creativity, focus, relaxation
- Allow custom tags
- Max 5 tags

**Visibility** (Required)
- Radio buttons:
  - ○ Free (available to all users)
  - ○ Premium (Premium & Elite only)
  - ○ Elite (Elite only)
- Default: Premium

**Featured** (Optional)
- Checkbox: [ ] Mark as featured track
- Featured tracks appear first in app

---

**4. Cover Art** (Optional)
- Upload image
- Recommended size: 1000×1000 px
- Accepted formats: JPG, PNG, WEBP
- If not provided, use wave type default

---

**Actions:**
- **Upload Track** button (primary)
- **Save as Draft** button (secondary)
- **Cancel** button

**Validation:**
- Audio file is required
- Track name is required
- Wave type is required
- Visibility is required

**Success:**
- Show success toast notification
- Redirect to Track Details page OR
- Stay on page with form reset (for bulk uploads)

---

### 3.3 Track Details Page

#### URL
`/admin/audio/tracks/:trackId`

#### Layout

**Header:**
- Back button
- Track name (editable inline)
- Wave type badge
- Featured star (clickable to toggle)
- Action buttons:
  - Edit
  - Duplicate
  - Download
  - Delete

**Track Player:**
- Large waveform visualization
- Play/Pause button
- Progress bar
- Current time / Total time
- Volume control

**Information Card:**
- Track Name
- Wave Type
- Duration
- File Size
- Format
- Upload Date
- Uploaded By (admin name)
- Visibility (Free/Premium/Elite)
- Featured status
- Tags
- Description

**Edit Button** → Makes fields editable

---

**Analytics Section:**

**Overall Stats (4 columns):**
- Total Plays
- Unique Listeners
- Avg Completion Rate
- Avg Rating (if ratings implemented)

**Plays Over Time (Line Chart):**
- Last 30 days
- Plays per day
- Compare to overall average

**Completion Rate:**
- % of users who complete full track
- Visual: Progress bar or donut chart

**User Demographics:**
- Who listens to this track?
- Subscription tier breakdown (Free/Premium/Elite)
- Top countries (if tracking location)

**Related Tracks:**
- "Users who listened to this also listened to..."
- Top 5 related tracks

---

**Comments/Feedback Section** (If Implemented):
- User ratings (stars)
- User comments
- Moderate/delete inappropriate comments

---

### 3.4 Collections Page

#### Purpose
Create curated playlists/collections of tracks for specific use cases.

#### Layout

**Header:**
- Page title: "Collections"
- Total count
- Create New Collection button

**Collections List:**

Each Collection Card:
- Collection name
- Description
- Track count
- Cover image (mosaic of track covers)
- Visibility (Free/Premium/Elite)
- Edit button
- Delete button
- Click → Collection Details

---

**Create/Edit Collection Modal:**

Form Fields:
- Collection Name (required)
- Description (optional)
- Visibility (Free/Premium/Elite)
- Cover Image (upload or auto-generate)
- Tracks:
  - Search and add tracks
  - Drag to reorder
  - Remove tracks
- Save button

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/audio/tracks` - List all tracks (with filters)
- `POST /api/admin/audio/upload` - Upload new track(s)
- `GET /api/admin/audio/tracks/:trackId` - Track details
- `PUT /api/admin/audio/tracks/:trackId` - Update track
- `DELETE /api/admin/audio/tracks/:trackId` - Delete track
- `GET /api/admin/audio/tracks/:trackId/analytics` - Track analytics
- `GET /api/admin/audio/collections` - List collections
- `POST /api/admin/audio/collections` - Create collection
- `PUT /api/admin/audio/collections/:collectionId` - Update collection
- `DELETE /api/admin/audio/collections/:collectionId` - Delete collection

**File Upload:**
- Use multipart/form-data
- Upload to Firebase Storage
- Generate unique filename (UUID)
- Store metadata in Firestore
- Create thumbnail/waveform visualization

---

## 4. SUBSCRIPTIONS PAGE

### 4.1 Active Subscriptions

#### Purpose
View and manage all active subscriptions.

#### Layout

**Header:**
- Page title: "Subscriptions"
- Total active subscriptions count
- Filter/search
- Export button

**Subscription Breakdown Cards (Top):**

4 Cards:
1. **Premium Monthly**
   - Count
   - MRR from this tier
2. **Premium Yearly**
   - Count
   - ARR from this tier
3. **Elite Monthly**
   - Count
   - MRR from this tier
4. **Elite Yearly**
   - Count
   - ARR from this tier

---

**Subscriptions Table:**

Columns:
1. User Name (click → user profile)
2. Email
3. Plan (badge: Premium Monthly, etc.)
4. Start Date
5. Next Billing Date
6. Amount
7. Status (Active/Cancelled/Past Due)
8. Actions:
   - View Details
   - Cancel
   - Refund
   - Change Plan

**Filters:**
- Plan type
- Status
- Billing period (monthly/yearly)
- Next billing date range

**Sort:**
- By next billing date
- By amount
- By start date

---

### 4.2 Revenue Dashboard

#### Purpose
Track revenue metrics and trends.

#### Layout

**Key Revenue Metrics (Top Row, 5 Cards):**

1. **MRR (Monthly Recurring Revenue)**
   - Current month MRR
   - Trend vs last month
   - Graph: 12-month trend

2. **ARR (Annual Recurring Revenue)**
   - MRR × 12
   - Projected annual revenue

3. **ARPU (Average Revenue Per User)**
   - Total revenue / Total users
   - Trend

4. **LTV (Customer Lifetime Value)**
   - Average revenue per customer over lifetime
   - Calculation: ARPU × Average subscription length

5. **CAC (Customer Acquisition Cost)**
   - Total marketing spend / New customers
   - From connected ad platforms or manual entry

**LTV:CAC Ratio:**
- Goal: 3:1 or higher
- Visual indicator (green if good, red if bad)

---

**Revenue Trends Chart:**
- Line/Bar combo chart
- Last 12 months
- Bars: Monthly revenue
- Line: Cumulative revenue
- Toggle: Show by plan type

**Revenue by Plan Type (Pie Chart):**
- Breakdown of revenue by subscription tier
- Percentages and amounts

**Revenue Forecast:**
- Based on current growth rate
- Next 3/6/12 months projection
- Confidence interval

---

### 4.3 Failed Payments

#### Purpose
Track and resolve failed payment attempts.

#### Layout

**Failed Payments Table:**

Columns:
1. User Name (click → user)
2. Email
3. Plan
4. Amount
5. Failed Date
6. Reason (Insufficient Funds, Card Expired, etc.)
7. Retry Attempts
8. Actions:
   - Retry Payment
   - Send Reminder Email
   - Contact User
   - Cancel Subscription

**Bulk Actions:**
- Send reminder emails to all
- Retry all payments

**Filters:**
- Date range
- Failure reason
- Plan type

---

### 4.4 Promo Codes

#### Purpose
Create and manage discount codes.

#### Layout

**Header:**
- Page title: "Promo Codes"
- Create New Code button

**Promo Codes List:**

Table Columns:
1. Code Name (e.g., "LAUNCH50")
2. Discount (20% or $5)
3. Type (Percentage / Fixed Amount / Free Trial)
4. Expiration Date
5. Usage Limit
6. Times Used
7. Status (Active/Inactive/Expired)
8. Actions (Edit, Deactivate, Delete)

---

**Create Promo Code Modal:**

Form:
- **Code Name** (required)
  - Text input, uppercase
  - Must be unique
  - Example: "LAUNCH50"

- **Discount Type** (required)
  - Radio:
    - Percentage Discount
    - Fixed Amount Discount
    - Free Trial Extension

- **Discount Value**
  - If Percentage: Input 1-100
  - If Fixed: Input dollar amount
  - If Trial: Input number of days

- **Applicable Plans** (required)
  - Checkboxes:
    - [ ] Premium Monthly
    - [ ] Premium Yearly
    - [ ] Elite Monthly
    - [ ] Elite Yearly
    - [ ] All Plans

- **Expiration Date** (optional)
  - Date picker
  - If empty, never expires

- **Usage Limits**
  - Total uses (optional): Max number of times code can be used
  - Per-user limit (optional): Max times one user can use it

- **Status**
  - Active / Inactive

**Save Button**

---

**Promo Code Analytics:**

For each code, show:
- Total redemptions
- Revenue generated (total amount discounted OR revenue from conversions)
- Conversion rate (how many who used code actually subscribed)
- Most active dates

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/subscriptions` - List subscriptions
- `GET /api/admin/subscriptions/revenue` - Revenue metrics
- `PUT /api/admin/subscriptions/:subId/cancel` - Cancel subscription
- `POST /api/admin/subscriptions/:subId/refund` - Refund
- `GET /api/admin/subscriptions/failed-payments` - Failed payments
- `POST /api/admin/subscriptions/retry-payment` - Retry failed payment
- `GET /api/admin/promo-codes` - List promo codes
- `POST /api/admin/promo-codes` - Create promo code
- `PUT /api/admin/promo-codes/:codeId` - Update promo code
- `DELETE /api/admin/promo-codes/:codeId` - Delete promo code
- `GET /api/admin/promo-codes/:codeId/analytics` - Code analytics

---

## 5. ANALYTICS PAGE

### 5.1 Engagement Analytics

#### Purpose
Understand how users engage with the app.

#### Layout

**Key Engagement Metrics (Top Cards):**

1. **DAU (Daily Active Users)**
   - Today's count
   - 7-day average
   - Trend

2. **WAU (Weekly Active Users)**
   - This week's count
   - 4-week average
   - Trend

3. **MAU (Monthly Active Users)**
   - This month's count
   - 3-month average
   - Trend

4. **Stickiness (DAU/MAU Ratio)**
   - Percentage
   - Goal: > 20%
   - Trend

5. **Avg Sessions Per User Per Day**
   - Number
   - Trend

6. **Avg Session Duration**
   - Minutes
   - Trend

7. **Session Completion Rate**
   - Percentage
   - Trend

---

**DAU/WAU/MAU Trend Chart:**
- Line graph
- Last 90 days
- Three lines: DAU, WAU, MAU
- Toggle to show/hide each

**Session Metrics Chart:**
- Last 30 days
- Bar chart: Total sessions per day
- Line overlay: Average session duration

**Peak Usage Times Heatmap:**
- Y-axis: Days of week (Mon-Sun)
- X-axis: Hours of day (0-23)
- Color intensity: Session count
- Tooltip: Exact session count
- Insight: "Peak usage: Tuesday 10am - 12pm"

---

### 5.2 Retention Analytics

#### Purpose
Track how well the app retains users over time.

#### Layout

**Retention Metrics (Top Cards):**

1. **Day 1 Retention**
   - % of users who return next day
   - Trend

2. **Day 7 Retention**
   - % of users who return within 7 days
   - Trend

3. **Day 30 Retention**
   - % of users who return within 30 days
   - Trend

4. **Churn Rate**
   - % of users who stopped using app
   - Trend

---

**Retention Curve Chart:**
- X-axis: Days since signup (0-90)
- Y-axis: % of users still active
- Line graph
- Cohort selector: Choose signup month

**Cohort Retention Table:**
- Rows: Signup month cohorts (Jan 2026, Feb 2026, etc.)
- Columns: Days/Weeks since signup (D0, D1, D7, D30, etc.)
- Cells: % retained, color-coded
  - Green: > 40%
  - Yellow: 20-40%
  - Red: < 20%
- Click cell → Drill down to users

**Churn Analysis:**
- Reasons for churn (if collected via exit survey):
  - Pie chart breakdown
  - Top 5 reasons
- Churn trend over time (line chart)
- At-risk users count (haven't used in 7+ days)

---

### 5.3 Conversion Funnel

#### Purpose
Visualize user journey from signup to paid subscription.

#### Layout

**Funnel Visualization:**

Steps:
1. **Signed Up**
   - Count: X users
   - 100%

2. **Completed First Session**
   - Count: Y users
   - % of signups
   - Drop-off: X - Y

3. **Completed 3+ Sessions**
   - Count: Z users
   - % of signups
   - Drop-off

4. **Started Premium Trial** (if applicable)
   - Count: A users
   - % of signups
   - Drop-off

5. **Converted to Premium**
   - Count: B users
   - % of signups (overall conversion rate)
   - Drop-off

**Visual:**
- Funnel chart (wide → narrow)
- Each stage as a bar
- Drop-off percentages highlighted
- Color-coded (green = good, yellow = needs improvement, red = critical)

**Filters:**
- Date range
- User segment (all, specific cohort)

**Insights:**
- "Biggest drop-off: Step 2 → Step 3 (45% drop)"
- "Opportunity: Improve onboarding to increase Day 1 completion"

**Comparison:**
- Compare different time periods
- Compare different user segments
- A/B test variants

---

### 5.4 Wave Performance Analytics

#### Purpose
Understand which wave types are most popular and effective.

#### Layout

**Wave Type Usage (Pie Chart):**
- Sessions by wave type
- Percentages
- Color-coded by wave type

**Wave Type Trends (Line Chart):**
- Last 90 days
- Lines for each wave type
- See which are growing/declining

**Wave Type by Time of Day (Stacked Area Chart):**
- X-axis: Hour of day (0-23)
- Y-axis: Sessions
- Stacked areas: Each wave type
- Insight: "Delta peaks at 10pm (sleep time)"

**Effectiveness Metrics (Table):**

Columns per Wave Type:
1. Total Sessions
2. Unique Users
3. Avg Session Length
4. Completion Rate
5. User Rating (if applicable)
6. Trend (↑ or ↓)

**Top Tracks per Wave Type:**
- For each wave, show top 3 tracks
- Play count
- Rating

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/analytics/engagement` - Engagement metrics
- `GET /api/admin/analytics/retention` - Retention data
- `GET /api/admin/analytics/cohorts` - Cohort analysis
- `GET /api/admin/analytics/funnel` - Conversion funnel data
- `GET /api/admin/analytics/wave-performance` - Wave type analytics

**Performance:**
- Cache heavily (analytics don't need real-time precision)
- Pre-compute complex metrics daily (background job)
- Use database indexes for fast queries

---

## 6. MARKETING PAGE

### 6.1 Push Notifications

#### Purpose
Send targeted push notifications to app users.

#### Layout

**Header:**
- Page title: "Push Notifications"
- Create New Notification button
- Scheduled Notifications tab
- Sent Notifications tab

---

**Create Notification Form:**

**1. Target Audience**

Who should receive this notification?

- Radio buttons:
  - ○ All Users
  - ○ Specific Subscription Tier
    - Checkboxes: Free, Premium, Elite
  - ○ Specific Segment
    - Dropdown: Power Users, At-Risk Users, New Users (< 7 days), Trial Users, etc.
  - ○ Custom Filter
    - Advanced filters: Last active, streak, session count, etc.

**Estimated Reach:** X users will receive this notification

---

**2. Notification Content**

**Title** (required)
- Text input
- Max 50 characters
- Example: "Don't break your streak!"

**Body** (required)
- Textarea
- Max 200 characters
- Example: "You're on a 14-day streak. Complete a session today to keep it going!"

**Image** (optional)
- Upload image (PNG, JPG)
- Size: 1200×600 px recommended

**Deep Link** (optional)
- Where should tapping notification take user?
- Dropdown:
  - Home Screen
  - Specific Track
  - Specific Wave Type
  - Profile
  - Custom URL

**Action Buttons** (optional, max 2)
- Button 1 Text: e.g., "Start Session"
- Button 1 Action: Deep link
- Button 2 Text: e.g., "View Streak"
- Button 2 Action: Deep link

---

**3. Scheduling**

When should this notification be sent?

- Radio buttons:
  - ○ Send Immediately
  - ○ Schedule for Later
    - Date picker
    - Time picker
    - Timezone selector
  - ○ Recurring
    - Daily at [time]
    - Weekly on [day] at [time]
    - Monthly on [date] at [time]

---

**4. A/B Testing** (Optional, Toggle)

Test two different versions:

**Variant A:**
- Title: [...]
- Body: [...]

**Variant B:**
- Title: [...]
- Body: [...]

**Test Settings:**
- Split: 50/50 (or custom: 60/40, 70/30)
- Success Metric: Open Rate / Click-Through Rate / Conversion
- Auto-select winner after: X hours
- Send winner to remaining users: Yes/No

---

**5. Preview**

Visual preview of how notification will look on:
- iOS (lock screen, notification center)
- Android (notification shade)

**Test Send:**
- Button: "Send Test to My Device"
- Enter device token or email

---

**Actions:**
- **Send / Schedule** button (primary)
- **Save as Draft** button
- **Cancel** button

---

**Sent Notifications List:**

Table:
1. Title
2. Sent To (segment description)
3. Sent Date/Time
4. Status (Sent, Scheduled, Draft, Failed)
5. Recipients (count)
6. Delivered (count)
7. Opened (count, %)
8. Clicked (count, %)
9. Conversions (if tracked)
10. Actions (View Details, Duplicate, Delete)

**Filters:**
- Status
- Date range
- Segment

**Click Notification Row:**
- View detailed analytics
- See exact users who received, opened, clicked

---

### 6.2 Email Campaigns

#### Purpose
Send email campaigns to users.

#### Layout

Similar structure to Push Notifications, but adapted for email:

**Create Email Campaign:**

**1. Recipients**
- Same targeting as push notifications
- Additional option: Import CSV of email addresses

**2. Email Content**

**Subject Line** (required)
- Max 100 characters

**Preview Text** (optional)
- What shows in inbox preview
- Max 150 characters

**From Name**
- Default: "Digital Coffee"
- Can customize

**From Email**
- Default: noreply@digitalcoffee.cafe
- Or: support@digitalcoffee.cafe

**Email Body**
- Rich text editor (WYSIWYG)
- Or HTML editor (for advanced users)
- Template library:
  - Welcome Email
  - Trial Ending
  - Subscription Renewed
  - New Feature Announcement
  - Weekly Summary
  - Re-engagement
  - Custom

**Personalization Tokens:**
- {{name}} - User's name
- {{streak}} - Current streak
- {{total_sessions}} - Total sessions
- {{join_date}} - Join date
- etc.

**Call-to-Action Button:**
- Button text
- Button link
- Button color

**3. Scheduling**
- Same as push notifications

**4. A/B Testing**
- Test subject lines
- Test email body
- Test CTA buttons

**5. Preview & Test**
- Preview in different email clients
- Send test email to yourself

---

**Email Campaign Analytics:**

For each sent campaign:
- Recipients
- Delivered (%)
- Opened (%, count)
- Clicked (%, count)
- Unsubscribed (%, count)
- Bounced (%, count)
- Marked as Spam (%, count)
- Conversions (if tracked)

**Email Performance Over Time:**
- Chart: Open rate and click rate trends

---

### 6.3 In-App Messages

#### Purpose
Display banners/announcements within the app.

#### Layout

**Create In-App Message:**

**1. Message Type**
- Banner (top of screen)
- Modal (popup)
- Full-screen takeover
- Tooltip (point to specific feature)

**2. Content**
- Title (optional)
- Body text
- Image (optional)
- CTA button (text + action)

**3. Targeting**
- Same as push notifications
- Additional: Target specific screens
  - Home screen
  - Player screen
  - Profile screen
  - All screens

**4. Display Rules**
- Start date
- End date
- Max impressions per user (e.g., show only once)
- Frequency (e.g., once per session, once per day)
- Dismissible (can user close it?)

**5. Priority**
- If multiple messages active, which shows first?
- High, Medium, Low

---

**In-App Messages List:**

Table:
1. Title
2. Type (Banner, Modal, etc.)
3. Status (Active, Scheduled, Ended, Draft)
4. Start Date
5. End Date
6. Impressions (count)
7. Clicks (count, %)
8. Dismissals (count)
9. Actions (Edit, Deactivate, Delete)

---

### Technical Specs

**API Endpoints:**
- `POST /api/admin/marketing/push-notifications` - Create notification
- `GET /api/admin/marketing/push-notifications` - List notifications
- `GET /api/admin/marketing/push-notifications/:id/analytics` - Analytics
- `POST /api/admin/marketing/email-campaigns` - Create email
- `GET /api/admin/marketing/email-campaigns` - List emails
- `GET /api/admin/marketing/email-campaigns/:id/analytics` - Analytics
- `POST /api/admin/marketing/in-app-messages` - Create message
- `GET /api/admin/marketing/in-app-messages` - List messages
- `GET /api/admin/marketing/in-app-messages/:id/analytics` - Analytics

**Integrations:**
- Push: Firebase Cloud Messaging (FCM) + Apple Push Notification Service (APNs)
- Email: SendGrid, AWS SES, or Mailgun
- Analytics: Track opens, clicks, conversions

---

## 7. SUPPORT PAGE

### 7.1 Support Tickets

#### Purpose
Manage customer support requests.

#### Layout

**Header:**
- Page title: "Support Tickets"
- Create New Ticket button (on behalf of user)
- Filter/search

**Tickets List:**

**Sidebar Filters:**
- Status:
  - [ ] Open
  - [ ] In Progress
  - [ ] Waiting on User
  - [ ] Resolved
  - [ ] Closed
- Priority:
  - [ ] Urgent
  - [ ] High
  - [ ] Medium
  - [ ] Low
- Assigned To:
  - [ ] Me
  - [ ] Unassigned
  - [ ] Other team members
- Date Range

**Main Table:**

Columns:
1. Ticket ID (#1234)
2. Subject
3. User (name, email)
4. Status (badge)
5. Priority (badge)
6. Created
7. Last Updated
8. Assigned To
9. Actions (View, Assign, Close)

**Sort:**
- By priority (Urgent first)
- By date (newest/oldest)
- By status

**Bulk Actions:**
- Assign selected to team member
- Close selected
- Change priority

**Color Coding:**
- Red: Urgent, overdue
- Orange: High priority
- Yellow: Medium priority
- Green: Low priority
- Gray: Closed

---

**Ticket Detail View:**

**Left Panel (70%):**

**Ticket Header:**
- Ticket ID
- Subject (editable)
- Status dropdown (change status)
- Priority dropdown (change priority)
- Assigned dropdown (assign to team member)
- Created date
- Last updated

**User Info (Quick View):**
- User avatar
- Name
- Email
- Click → Full user profile
- Quick stats: Sessions, Streak, Subscription

**Conversation Thread:**
- Chronological messages
- User messages (left-aligned, blue)
- Admin responses (right-aligned, gray)
- Internal notes (yellow, only visible to admins)
- System messages (centered, gray)

**Each Message:**
- Avatar
- Name
- Timestamp
- Message content
- Attachments (if any)

**Reply Box:**
- Textarea for response
- Attach file button
- Mark as Internal Note checkbox
- Rich text formatting (bold, italic, links, etc.)
- Saved replies dropdown (canned responses)
- Send button

**Saved Replies Examples:**
- "Thanks for reaching out! We're looking into this."
- "We've resolved the issue. Please try again."
- "Can you provide more details?"

---

**Right Panel (30%):**

**Ticket Actions:**
- Assign to Me
- Assign to Other
- Change Status
- Change Priority
- Merge with Another Ticket
- Delete Ticket

**Ticket Metadata:**
- Ticket ID
- Created
- Last Updated
- First Response Time
- Resolution Time
- Number of Messages
- Tags (add/edit)

**Related Information:**
- User's other tickets (list)
- User's session history (last 5)
- User's subscription info

**Internal Notes:**
- Private notes visible only to admins
- Add note button
- Threaded notes

---

**Ticket Metrics Dashboard:**

**KPIs:**
- Total Open Tickets
- Avg First Response Time
- Avg Resolution Time
- Customer Satisfaction Score (if implemented)
- Tickets Resolved Today/This Week

**Charts:**
- Tickets Over Time (line chart)
- Tickets by Status (pie chart)
- Tickets by Priority (bar chart)
- Response Time Trends (line chart)

---

### 7.2 FAQ Manager

#### Purpose
Create and manage FAQ content shown in the app.

#### Layout

**Header:**
- Page title: "FAQ Manager"
- Create New FAQ button
- Search

**FAQ List:**

Grouped by Category:

**Category: Getting Started**
- FAQ 1: How do I create an account?
- FAQ 2: How do I listen to my first track?
- FAQ 3: What are binaural beats?

**Category: Subscriptions**
- FAQ 4: How much does Premium cost?
- FAQ 5: Can I cancel anytime?
- FAQ 6: What's the difference between Premium and Elite?

**Category: Troubleshooting**
- FAQ 7: The app won't play audio
- FAQ 8: I can't log in
- FAQ 9: My streak didn't count

**Each FAQ Item:**
- Question (headline)
- Visibility toggle (Published/Draft)
- View count
- Helpful/Not Helpful ratio
- Edit button
- Delete button
- Drag handle (to reorder)

---

**Create/Edit FAQ:**

Form:
- **Category** (dropdown or create new)
- **Question** (text input)
- **Answer** (rich text editor)
  - Supports: bold, italic, links, images, videos, code blocks
- **Visibility** (Published/Draft)
- **Order** (number, for sorting within category)
- **Tags** (optional, for search)

**Preview:** See how it looks in app

**Save Button**

---

**FAQ Analytics:**

For each FAQ:
- Views
- Helpful votes
- Not Helpful votes
- Ratio (% helpful)

**Identify Pain Points:**
- FAQs with low helpful ratio = confusing, needs improvement
- Most viewed FAQs = common questions, consider improving UX to reduce need

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/support/tickets` - List tickets
- `POST /api/admin/support/tickets` - Create ticket
- `GET /api/admin/support/tickets/:ticketId` - Ticket details
- `PUT /api/admin/support/tickets/:ticketId` - Update ticket
- `POST /api/admin/support/tickets/:ticketId/messages` - Add message
- `GET /api/admin/support/faqs` - List FAQs
- `POST /api/admin/support/faqs` - Create FAQ
- `PUT /api/admin/support/faqs/:faqId` - Update FAQ
- `DELETE /api/admin/support/faqs/:faqId` - Delete FAQ

---

## 8. REPORTS PAGE

### Purpose
Generate and export reports for business analysis.

### Layout

**Pre-Built Reports:**

List of report templates:

1. **Monthly Revenue Report**
   - Description: "Total revenue, breakdown by tier, new/churned subscriptions"
   - Run button

2. **User Growth Report**
   - Description: "New signups, active users, growth rate"
   - Run button

3. **Engagement Report**
   - Description: "Sessions, completion rates, most popular tracks"
   - Run button

4. **Track Performance Report**
   - Description: "Top tracks by plays, ratings, completion rates"
   - Run button

5. **Subscription Report**
   - Description: "Active subscriptions, churn rate, upgrade/downgrade trends"
   - Run button

---

**Run Report Flow:**

1. Click "Run" on a report template
2. Modal opens:
   - **Date Range** (picker: Last 7/30/90 days, Custom range)
   - **Format** (dropdown: PDF, CSV, Excel)
   - **Email to** (optional: enter email to send report)
   - **Generate Report** button
3. Report generates (loading indicator)
4. Report displays in dashboard (table/charts)
5. Download button (PDF/CSV/Excel)
6. Option to schedule recurring (daily, weekly, monthly)

---

**Custom Report Builder:**

**Create Custom Report Button**

Form:
- **Report Name**
- **Metrics to Include** (checkboxes):
  - User metrics (signups, active users, etc.)
  - Session metrics (total, avg duration, etc.)
  - Revenue metrics (MRR, ARPU, etc.)
  - Wave type metrics
  - Track metrics
- **Filters** (date range, user segment, etc.)
- **Grouping** (by day, week, month, wave type, etc.)
- **Format** (table, chart, both)
- **Save** (save for reuse)

---

**Scheduled Reports:**

List of reports set to auto-generate:

Table:
1. Report Name
2. Frequency (Daily, Weekly, Monthly)
3. Next Run Date
4. Recipients (emails)
5. Format
6. Actions (Edit, Pause, Delete, Run Now)

**Create Scheduled Report:**
- Choose report template or custom
- Set frequency
- Set time of day
- Set recipients (email addresses)
- Save

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/reports/templates` - List report templates
- `POST /api/admin/reports/generate` - Generate report
- `GET /api/admin/reports/scheduled` - List scheduled reports
- `POST /api/admin/reports/scheduled` - Create scheduled report
- `PUT /api/admin/reports/scheduled/:reportId` - Update scheduled report
- `DELETE /api/admin/reports/scheduled/:reportId` - Delete scheduled report

**Report Generation:**
- Generate in background (queue job)
- Notify when complete
- Store in cloud storage (S3, Firebase Storage)
- Auto-delete after 30 days (configurable)

---

## 9. SETTINGS PAGE

### 9.1 App Settings

#### Purpose
Configure app-wide settings and feature flags.

#### Layout

**Free Tier Configuration:**

- **Sessions Per Day Limit**
  - Number input
  - Default: 3
  - Description: "How many sessions can free users complete per day?"

- **Free Tracks**
  - Multi-select dropdown
  - Choose which tracks are available to free users
  - Or: "1-2 tracks per wave type" (auto-select)

- **Ad Frequency**
  - Number input
  - Default: 1 ad every 3 sessions
  - Toggle: Enable/Disable Ads

---

**Feature Flags:**

Toggle switches to enable/disable features:

- [ ] Streaks
- [ ] Referral Program
- [ ] In-App Purchases
- [ ] Offline Downloads
- [ ] Social Sharing
- [ ] Dark Mode
- [ ] Background Playback
- [ ] Analytics Dashboard (for users)
- [ ] Custom Timers
- [ ] Session Programs

---

**App Maintenance:**

- **Maintenance Mode**
  - Toggle: ON/OFF
  - When ON, app shows "Under Maintenance" screen
  - Message to display (customizable)

- **Force Update**
  - Min App Version (iOS)
  - Min App Version (Android)
  - If user's version < min, force them to update

---

**App Information:**

- App Name: Digital Coffee
- Current Version: 1.0.0
- Build Number: 100
- Last Deployed: Date/time
- Environment: Production / Staging / Development

---

### 9.2 Payment Settings

#### Purpose
Configure Stripe and payment-related settings.

#### Layout

**Stripe Configuration:**

- **API Keys**
  - Publishable Key (text input, read-only)
  - Secret Key (password input, masked)
  - Test Mode toggle

- **Webhook Endpoint**
  - URL (read-only)
  - Status: Active / Inactive
  - Last Event Received: timestamp

- **Webhook Secret**
  - Text input (password, masked)

---

**Pricing Configuration:**

Table:
| Plan | Billing Period | Price | Stripe Price ID | Actions |
|------|----------------|-------|-----------------|---------|
| Premium | Monthly | $9.99 | price_xxx | Edit |
| Premium | Yearly | $79.99 | price_yyy | Edit |
| Elite | Monthly | $19.99 | price_zzz | Edit |
| Elite | Yearly | $159.99 | price_aaa | Edit |
| Lifetime | One-time | $299.00 | price_bbb | Edit |

**Edit Price:**
- Update amount
- Update Stripe Price ID
- Save

---

**Tax Settings:**

- **Collect Tax** (toggle)
- **Tax Provider** (dropdown: Stripe Tax, Manual)
- **Tax Rates** (if manual):
  - Add tax rate by country/state
  - Percentage

---

**Invoice Settings:**

- **Company Name** (for invoices)
- **Company Address**
- **Tax ID / VAT Number**
- **Invoice Email** (from address)
- **Invoice Prefix** (e.g., "DC-INV-")

---

**Refund Policy:**

- Text editor
- Policy displayed to users
- Save button

---

### 9.3 Team Management

#### Purpose
Manage admin users and their permissions.

#### Layout

**Team Members List:**

Table:
1. Avatar
2. Name
3. Email
4. Role (dropdown: Super Admin, Content Manager, Support Agent, Analyst, Marketing)
5. Status (Active / Inactive)
6. Last Login
7. Actions (Edit, Deactivate, Delete)

**Invite New Admin:**

Form:
- Email
- Role (dropdown)
- Send Invitation button

---

**Roles & Permissions:**

Table showing what each role can do:

| Permission | Super Admin | Content Manager | Support | Analyst | Marketing |
|------------|-------------|-----------------|---------|---------|-----------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Users | ✓ | ✗ | View Only | View Only | ✗ |
| Upload Audio | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete Audio | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Revenue | ✓ | ✗ | ✗ | ✓ | ✗ |
| Manage Subscriptions | ✓ | ✗ | ✗ | ✗ | ✗ |
| Send Notifications | ✓ | ✗ | ✗ | ✗ | ✓ |
| Respond to Tickets | ✓ | ✗ | ✓ | ✗ | ✗ |
| View Analytics | ✓ | ✗ | ✗ | ✓ | ✓ |
| Change Settings | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Team | ✓ | ✗ | ✗ | ✗ | ✗ |

---

**Activity Log:**

Audit trail of admin actions:

Table:
1. Timestamp
2. Admin Name
3. Action (e.g., "Uploaded track", "Deleted user", "Changed pricing")
4. Details
5. IP Address

**Filters:**
- Admin
- Action type
- Date range

**Export:** CSV

---

### Technical Specs

**API Endpoints:**
- `GET /api/admin/settings/app` - Get app settings
- `PUT /api/admin/settings/app` - Update app settings
- `GET /api/admin/settings/payment` - Get payment settings
- `PUT /api/admin/settings/payment` - Update payment settings
- `GET /api/admin/team` - List team members
- `POST /api/admin/team/invite` - Invite new admin
- `PUT /api/admin/team/:adminId` - Update admin
- `DELETE /api/admin/team/:adminId` - Remove admin
- `GET /api/admin/activity-log` - Get activity log

---

## Components Library

### Reusable UI Components

To ensure consistency and speed up development, create a library of reusable components:

#### 1. Layout Components

**Sidebar**
- Fixed left sidebar
- Logo at top
- Navigation menu
- Collapse/expand toggle
- Active state highlighting

**Header/Topbar**
- Breadcrumbs
- Page title
- Action buttons (right-aligned)
- User profile dropdown (top-right)
- Notifications bell

**Page Container**
- Consistent padding
- Responsive width
- Background color

---

#### 2. Data Display Components

**MetricCard**
- Props: title, value, trend, sparkline, onClick
- Displays key metric with visual indicator
- Responsive sizing

**DataTable**
- Props: columns, data, sortable, filterable, pagination, actions
- Sortable headers
- Row selection (checkboxes)
- Pagination controls
- Loading state
- Empty state

**Chart Components**
- LineChart
- BarChart
- PieChart
- DonutChart
- AreaChart
- Heatmap
- All using Recharts or Chart.js

---

#### 3. Form Components

**Input**
- Text, email, number, password
- Label, placeholder, error message
- Validation states

**Textarea**
- For longer text input
- Character counter (optional)

**Select/Dropdown**
- Single select
- Multi-select
- Searchable
- Custom options rendering

**DatePicker**
- Single date
- Date range
- Time picker

**FileUpload**
- Drag-and-drop
- Multiple files
- Preview
- Progress bar

**Toggle/Switch**
- ON/OFF states
- Disabled state

**RadioGroup**
- Multiple options
- Single selection

**CheckboxGroup**
- Multiple options
- Multiple selections

**RichTextEditor**
- WYSIWYG editing
- Markdown support
- Insert images, links

---

#### 4. Feedback Components

**Button**
- Variants: primary, secondary, danger, ghost
- Sizes: small, medium, large
- Loading state
- Disabled state
- Icon support

**Badge**
- Color variants (success, warning, danger, info)
- Sizes

**Alert/Notification**
- Types: success, warning, error, info
- Dismissible
- Toast (auto-dismiss after X seconds)

**Modal**
- Overlay
- Header, body, footer
- Close button
- Sizes: small, medium, large, full-screen

**Tooltip**
- Show on hover
- Positions: top, bottom, left, right

**Loading Spinner**
- Full page
- Inline
- Button loading state

**ProgressBar**
- Determinate (known progress)
- Indeterminate (loading)

---

#### 5. Navigation Components

**Tabs**
- Horizontal tabs
- Active state
- Badge counts

**Breadcrumbs**
- Show navigation path
- Clickable links

**Pagination**
- Page numbers
- Previous/Next
- Jump to page
- Items per page selector

---

#### 6. Status Indicators

**StatusDot**
- Color-coded status (green, yellow, red)
- With label

**TrendIndicator**
- Up/down arrow
- Percentage change
- Color-coded

---

## Design System

### Colors

**Primary Colors:**
- Primary: #6F4E37 (Coffee brown)
- Secondary: #C19A6B (Cappuccino)
- Accent: #9B6B4E (Latte)

**Wave Type Colors:** (Match mobile app)
- Delta: #1E3A8A (Deep blue)
- Theta: #7C3AED (Purple)
- Alpha: #9F7AEA (Light purple)
- Beta: #2563EB (Blue)
- Gamma: #F59E0B (Orange)

**Semantic Colors:**
- Success: #10B981 (Green)
- Warning: #F59E0B (Orange)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Blue)

**Neutral Colors:**
- Gray 50-900 (Tailwind scale)
- White: #FFFFFF
- Black: #000000

**Backgrounds:**
- Primary: #FFFFFF
- Secondary: #F9FAFB
- Surface: #F3F4F6
- Dark: #1F2937

**Text:**
- Primary: #111827
- Secondary: #6B7280
- Muted: #9CA3AF
- On Dark: #FFFFFF

---

### Typography

**Font Family:**
- Primary: Inter, -apple-system, BlinkMacSystemFont, sans-serif

**Font Sizes:**
- Display: 48px
- H1: 36px
- H2: 30px
- H3: 24px
- H4: 20px
- Body: 16px
- Small: 14px
- Tiny: 12px

**Font Weights:**
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights:**
- Tight: 1.25
- Normal: 1.5
- Relaxed: 1.75

---

### Spacing

Use consistent spacing scale (Tailwind):
- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 5: 20px
- 6: 24px
- 8: 32px
- 10: 40px
- 12: 48px
- 16: 64px
- 20: 80px

---

### Shadows

- sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
- xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

---

### Border Radius

- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px (circles)

---

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large: > 1280px

---

## User Roles & Permissions

### Role Definitions

**1. Super Admin**
- Full access to everything
- Can manage team members
- Can change critical settings
- View all data and analytics

**2. Content Manager**
- Upload, edit, delete audio tracks
- Manage collections
- View track analytics
- NO access to user data, revenue, or settings

**3. Support Agent**
- View user profiles (read-only)
- Respond to support tickets
- Manage FAQ
- View support analytics
- NO access to revenue, settings, or audio management

**4. Analyst**
- View all analytics and reports
- Export data
- NO ability to change anything
- Read-only access to user data

**5. Marketing**
- Send notifications and emails
- Create in-app messages
- Manage promo codes
- View marketing analytics
- NO access to revenue, settings, or user management

---

## Authentication & Security

**Admin Login:**
- Email/password authentication
- 2FA (Two-Factor Authentication) required for Super Admins
- Password requirements: min 12 characters, uppercase, lowercase, number, special char
- Session timeout: 8 hours
- Remember me (optional): 30 days

**Security Features:**
- Rate limiting on login attempts (5 attempts, then lockout for 15 min)
- Activity logging (all actions tracked)
- IP whitelisting (optional, for high-security environments)
- Encrypted sensitive data (API keys, passwords)

---

## Performance & Optimization

**Frontend:**
- Code splitting (lazy load pages)
- Image optimization (WebP, lazy loading)
- Caching (cache API responses for 30-60 seconds)
- Virtualized lists (for long tables)
- Debounced search inputs

**Backend:**
- Database indexing (on frequently queried fields)
- Caching (Redis for session data, frequently accessed data)
- Pagination (limit query results)
- Background jobs (for heavy computations, report generation)
- CDN for static assets

**Monitoring:**
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- Uptime monitoring (Pingdom, UptimeRobot)

---

## Deployment

**Hosting:**
- Frontend: Vercel (or Firebase Hosting, Netlify)
- Backend: Railway, Render, or Firebase Functions
- Database: Firestore (or MongoDB Atlas)
- Storage: Firebase Storage (or AWS S3)

**CI/CD:**
- GitHub Actions (or GitLab CI)
- Auto-deploy on push to main branch
- Run tests before deploy
- Staging environment for testing

**Environments:**
- Development (local)
- Staging (testing)
- Production (live)

---

## Next Steps for Development

1. ✅ Review and approve this dashboard specification
2. Set up project structure (create Vite + React + TypeScript project)
3. Set up Tailwind CSS
4. Create design system components
5. Build authentication system
6. Build sidebar and layout components
7. Implement each page one by one (start with Overview)
8. Integrate with backend API
9. Testing (unit tests, integration tests)
10. Deploy to staging
11. User acceptance testing
12. Deploy to production

---

**Document Version:** 1.0
**Last Updated:** April 14, 2026
**Status:** Draft - Pending Approval
