# Local Development

## Running the App Locally

### Start the Backend (Firebase Emulators)

```bash
cd functions
npm start
```

This will:

- Start TypeScript compiler in watch mode
- Download environment variables from Doppler
- Start Firebase emulators (Functions, Firestore, Auth, Pub/Sub)
- Import data from `./emulators-data`

### Start the Frontend (Web App)

```bash
cd web
npm run dev
```

The web app will be available at http://localhost:5173

### Start the Tunnel (For Webhooks)

To receive webhooks from external services (e.g., Square), start the ngrok tunnel:

```bash
cd functions
npm run tunnel
```

This will expose your local Functions emulator at `https://reorderly.ngrok.app`, allowing external services to send webhooks to your local environment.

## Testing Authenticated Cloud Functions

To test onCall functions that require authentication using Postman or curl:

### 1. Update the User ID

Edit `functions/src/devUtils/get-id-token.ts` and set the `uid_or_email` variable to your test user's UID or email:

```typescript
const uid_or_email = 'your-user-id-or-email@example.com';
```

### 2. Generate an ID Token

```bash
cd functions
npm run get-id-token
```

This script will:

- Look up the user by UID or email (hardcoded in the script)
- Generate a custom token
- Exchange it for an ID token
- Print the ID token to the console

### 3. Use the Token in Requests

Copy the printed ID token and use it in the `Authorization` header:

```
Authorization: Bearer <ID_TOKEN>
```

## Testing Scheduled Functions

Scheduled functions in the Firebase emulator have a numeric suffix (e.g., `-0`, `-1`) rather than the exact exported name.

**Example:**

```typescript
// In code
export const scheduledTokenRefresh = onSchedule(...);

// In emulator - note the -0 suffix
curl -X POST http://localhost:3302/scheduledTokenRefresh-0
```

### Finding the Correct Function Name

If you call a function without the suffix, the emulator will list all valid function names:

```bash
curl http://localhost:3302/scheduledTokenRefresh

# Error response shows:
# Function scheduledTokenRefresh does not exist, valid functions are:
# squareAuthorize, squareCallback, scheduledTokenRefresh-0, onCallTest
```

Use the name with the `-0` suffix to invoke the scheduled function manually for testing.

**Note:** The suffix only exists in the emulator. In production, scheduled functions run automatically on their defined schedule.

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors, kill the existing processes:

```bash
lsof -ti:3302 | xargs kill  # Functions
lsof -ti:3303 | xargs kill  # Firestore
```

### Environment Variable Issues

- Ensure you're logged into Doppler: `doppler login`
- Verify your Doppler project/config: `doppler configure`
- Check `.env` file was created: `cat functions/.env`

### ID Token Not Working

- Ensure `WEB_API_KEY` and `GOOGLE_APPLICATION_CREDENTIALS` are from the **same Firebase project**
- Check that the user exists in Firebase Auth emulator
- Verify the token hasn't expired (tokens are valid for 1 hour)
