# Testing Scheduled Functions in Firebase Emulators

## Function Name Suffix

Firebase emulators expose scheduled functions with a numeric suffix (e.g., `-0`, `-1`) rather than the exact exported name.

**Example:**

```typescript
// In code
export const scheduledTokenRefresh = onSchedule(...);

// In emulator
// ❌ scheduledTokenRefresh - does not exist
// ✅ scheduledTokenRefresh-0 - actual callable name
```

## Finding the Correct Name

If you try to call the function without the suffix, the emulator will tell you the valid function names:

```bash
curl http://localhost:5001/.../scheduledTokenRefresh

# Error response:
Function us-central1-scheduledTokenRefresh does not exist, valid functions are:
us-central1-squareAuthorize,
us-central1-squareCallback,
us-central1-scheduledTokenRefresh-0,  ← Use this one
us-central1-onCallTest
```

## Calling Scheduled Functions

Once you have the correct name with suffix:

```bash
# Local emulator
curl -X POST http://localhost:5001/reorderly-staging/us-central1/scheduledTokenRefresh-0

# Or using Firebase CLI
firebase functions:shell
> scheduledTokenRefresh_0()
```

**Note:** The suffix is automatically added by the emulator and doesn't affect deployed functions - in production, the function runs on its defined schedule.
