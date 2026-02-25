# Firebase & Google Auth Setup Guide

## Step 1: Get Firebase Web Credentials

1. Open: https://console.firebase.google.com/project/digital-coffee-app
2. Click ⚙️ (Settings) → **Project settings**
3. Scroll to **"Your apps"**
4. If you see a Web app (</> icon):
   - Click on it to view the config
5. If no Web app exists:
   - Click **"Add app"** → Select **Web** (</>)
   - Name: `Digital Coffee Web`
   - Click **"Register app"**
6. **Copy the firebaseConfig object** - it looks like:

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "digital-coffee-app.firebaseapp.com",
  projectId: "digital-coffee-app",
  storageBucket: "digital-coffee-app.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc..."
}
```

## Step 2: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Click **"Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. Click **"Save"**

## Step 3: Enable Google Sign-In

1. Still in **Authentication → Sign-in method**
2. Click **"Google"**
3. **Enable** the toggle
4. Set **Project support email**: your-email@gmail.com
5. Click **"Save"**
6. **Copy the Web client ID** that appears (looks like: `123456789-abc...apps.googleusercontent.com`)

## Step 4: Add iOS OAuth Client (for Google Sign-In on iOS)

1. Go to: https://console.cloud.google.com/apis/credentials?project=digital-coffee-app
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Application type: **iOS**
4. Name: `Digital Coffee iOS`
5. Bundle ID: `com.digitalcoffee.app`
6. Click **"CREATE"**
7. **Copy the iOS client ID** that's generated

## What to Provide

Please paste these values:

```
apiKey:
authDomain:
projectId:
storageBucket:
messagingSenderId:
appId:
webClientId: (from Step 3)
iosClientId: (from Step 4)
```

## Next Steps After You Provide Credentials

Once you provide these, I will:
1. Update the Firebase config
2. Add Google Sign-In buttons to Login/Register screens
3. Test the full authentication flow
4. Connect to your backend API
