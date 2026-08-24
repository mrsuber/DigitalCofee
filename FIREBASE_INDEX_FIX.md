# Firebase Firestore Index Fix

## Issue
The mobile app shows this error:
```
Failed to load sessions: 9 FAILED_PRECONDITION: The query requires an index.
```

This happens because Firestore requires composite indexes for complex queries that involve multiple fields.

## Solution

### Option 1: Click the Link in Error Message (Easiest)
The error message includes a direct link to create the index. Click this link:

```
https://console.firebase.google.com/v1/r/project/digital-coffee-app/firestore/indexes?create_composite=ClNwcm9qZWN0cy9kaWdpdGFsLWNvZmZlZS1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Nlc3Npb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXN0YXJ0VGltZRACGgwKCF9fbmFtZV9fEAI
```

This will:
1. Open Firebase Console
2. Auto-fill the index configuration
3. You just need to click "Create Index"
4. Wait 1-2 minutes for the index to build

### Option 2: Manual Creation

If the link doesn't work, create the index manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `digital-coffee-app`
3. Navigate to: **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID:** `sessions`
   - **Fields to index:**
     1. `userId` - Ascending
     2. `startTime` - Descending
   - **Query scope:** Collection
6. Click **Create**

### Additional Indexes Needed

Based on the backend code, you may also need these indexes:

#### For Streak History Queries
- **Collection:** `sessions`
- **Fields:**
  1. `completed` - Ascending
  2. `userId` - Ascending
  3. `startTime` - Descending

**Create Link:** Click the error link when this query runs, or create manually:
```
https://console.firebase.google.com/v1/r/project/digital-coffee-app/firestore/indexes?create_composite=ClNwcm9qZWN0cy9kaWdpdGFsLWNvZmZlZS1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Nlc3Npb25zL2luZGV4ZXMvXxABGg0KCWNvbXBsZXRlZBABGgoKBnVzZXJJZBABGg0KCXN0YXJ0VGltZRACGgwKCF9fbmFtZV9fEAI
```

## Why This Happens

Firestore automatically creates single-field indexes, but complex queries that combine multiple fields (like filtering by `userId` AND sorting by `startTime`) require composite indexes that must be explicitly created.

## Verification

After creating the index:

1. Wait 1-2 minutes for index to finish building
2. Check index status in Firebase Console (should show "Enabled")
3. Restart your mobile app
4. The "Failed to load sessions" error should be gone
5. App should successfully load user sessions and stats

## Affected Queries

These backend endpoints require the index:

### `/api/sessions` (GET)
```javascript
db.collection('sessions')
  .where('userId', '==', userId)
  .orderBy('startTime', 'desc')
  .limit(50)
  .get()
```

### `/api/stats/streak` (GET)
```javascript
db.collection('sessions')
  .where('completed', '==', true)
  .where('userId', '==', userId)
  .orderBy('startTime', 'desc')
  .get()
```

## Common Issues

### Index Not Working After Creation
- **Wait Time:** Indexes can take a few minutes to build
- **Check Status:** Go to Indexes tab in Firebase Console
- **Status should be:** "Enabled" (not "Building")

### Multiple Index Errors
- **Solution:** Create indexes one at a time
- **Tip:** The error message includes a direct link for each index needed

### Production vs Development
- **Note:** Indexes are project-specific
- **If you have multiple Firebase projects:** Create indexes in each

## Quick Test

After creating the index, test with:

```bash
# In mobile app
1. Open app
2. Navigate to Profile tab
3. Check if "Recent Sessions" loads without error
4. Verify stats display correctly
```

## Index Configuration Reference

```json
{
  "indexes": [
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "completed", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Automation (Optional)

You can also deploy indexes using Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

Create `firestore.indexes.json` in your project root with the configuration above.

---

**Status:** Audio files are ready ✅ | Firestore indexes need to be created
**Next:** Click the error link to create the index, then test the mobile app
