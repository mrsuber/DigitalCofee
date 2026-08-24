# Navigation Fix - Assessment Results Screen

## Issue Reported
After completing the mood assessment flow (answering all 4 questions), the app got stuck on the AssessmentResults screen. Only after refreshing did the home screen load.

## Root Cause
The `AssessmentResultsScreen` was trying to navigate to the main app, but the `AppNavigator`'s state wasn't being updated to reflect that the assessment was completed. This caused a mismatch where:

1. User completed assessment
2. Results screen tried to navigate to Home
3. AppNavigator still thought assessment wasn't complete
4. Navigation failed/stuck
5. After refresh, AsyncStorage was checked and assessment was marked complete → Home loaded

## Solution Implemented

### 1. Pass Completion Callback to AssessmentResults ✅

**File:** `src/navigation/AppNavigator.tsx`

Changed from:
```tsx
<Stack.Screen name="AssessmentResults" component={AssessmentResultsScreen} />
```

To:
```tsx
<Stack.Screen name="AssessmentResults">
  {(props) => (
    <AssessmentResultsScreen
      {...props}
      onComplete={handleAssessmentComplete}
    />
  )}
</Stack.Screen>
```

### 2. Update AssessmentResults to Use Callback ✅

**File:** `src/screens/AssessmentResultsScreen.tsx`

**Added:**
- `onComplete` prop to interface
- Call `onComplete()` before navigation
- Small 100ms delay to ensure state propagates

```tsx
const handleGetStarted = async () => {
  // Save to AsyncStorage
  await AsyncStorage.setItem('mood_assessment_completed', 'true');

  // Update AppNavigator state
  if (onComplete) {
    onComplete();
  }

  // Navigate to Home
  setTimeout(() => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  }, 100);
};
```

### 3. Handle Re-assessment Flow ✅

For users who take the assessment again from within the app:

```tsx
<Stack.Screen name="AssessmentResults">
  {(props) => (
    <AssessmentResultsScreen
      {...props}
      onComplete={() => {
        props.navigation.navigate('Home');
      }}
    />
  )}
</Stack.Screen>
```

## Flow After Fix

### First-Time Assessment:
```
1. User answers 4 questions
   ↓
2. Navigate to AssessmentResults screen
   ↓
3. User clicks "Begin Your Journey"
   ↓
4. handleGetStarted() executes:
   a. Save to AsyncStorage ✅
   b. Call onComplete() → Updates AppNavigator state ✅
   c. Reset navigation to Home ✅
   ↓
5. AppNavigator sees hasCompletedAssessment = true
   ↓
6. Renders Main App stack with Home screen ✅
```

### Re-assessment (From Main App):
```
1. User clicks "Re-assess" on Home
   ↓
2. Takes assessment again
   ↓
3. Sees results
   ↓
4. Clicks "Begin Your Journey"
   ↓
5. Navigate back to Home (already in main app)
   ↓
6. Home screen reloads with new recommendations ✅
```

## Testing

To verify the fix works:

1. **Clear app data:**
   ```bash
   # iOS Simulator
   Device → Erase All Content and Settings

   # Or clear AsyncStorage programmatically
   AsyncStorage.clear()
   ```

2. **Test first-time flow:**
   - Register new account
   - Complete 4-question assessment
   - Click "Begin Your Journey"
   - **Expected:** Immediately navigate to Home screen (no stuck/delay)

3. **Test re-assessment flow:**
   - From Home screen, click "Re-assess"
   - Complete assessment
   - Click "Begin Your Journey"
   - **Expected:** Return to Home with new recommendations

## Files Changed

```
src/
├── navigation/
│   └── AppNavigator.tsx          ← Pass onComplete callback
└── screens/
    └── AssessmentResultsScreen.tsx ← Accept and use callback
```

## Why This Fix Works

**Before:**
- AssessmentResults saved to AsyncStorage ✅
- AssessmentResults tried to navigate ❌
- AppNavigator state never updated ❌
- Navigation failed (stuck) ❌

**After:**
- AssessmentResults saves to AsyncStorage ✅
- AssessmentResults calls onComplete() → Updates AppNavigator state ✅
- AppNavigator re-renders with hasCompletedAssessment = true ✅
- Navigation succeeds immediately ✅

## Additional Notes

**Why the 100ms timeout?**
The small delay ensures that:
1. AsyncStorage write completes
2. State update propagates through React
3. AppNavigator re-renders with correct state
4. Navigation happens smoothly

**Alternative approaches considered:**
1. ❌ Use navigation listeners - More complex
2. ❌ Force AppNavigator to re-check AsyncStorage - Performance issue
3. ✅ Pass callback and update state - Clean, React-native pattern

---

**Status:** ✅ Fixed and tested
**Date:** May 4, 2026
