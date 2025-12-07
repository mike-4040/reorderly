# Square Merchants Token Refresh

Automated system to keep Square merchant OAuth tokens fresh.

## How It Works

1. **Scheduled Job** - Runs daily at midnight (LA time)
   - Queries merchants not refreshed in the last 24 hours
   - Processes in batches of 50 with error isolation

2. **Refresh Attempt** - Per merchant
   - 3 retry attempts with 5-second delays
   - On **success**: Updates tokens, resets `refresh_failure_count` to 0
   - On **failure**: Increments `refresh_failure_count`, updates `last_refreshed_at`

3. **Revocation** - After 3 consecutive scheduled failures
   - Sets `revoked = true`
   - Captures error to Sentry
   - Total: 9 attempts before revocation (3 days × 3 retries)

## Database Fields

- `last_refreshed_at` - Last attempt timestamp (success or failure)
- `refresh_failure_count` - Consecutive failures (0 = healthy)
- `revoked` - Token permanently revoked

## Files

- `merchants/scheduled-refresh.ts` - Scheduled Cloud Function
- `merchants/token-refresh.ts` - Refresh logic with retries
- `datastore/merchants.ts` - `getMerchantsNeedingRefresh()` query
- `oauth/square/client.ts` - Square API `refreshAccessToken()`

## Monitoring

- Sentry captures all failures and revocations
- Console logs show batch success/failure counts
- `refresh_failure_count` in DB shows merchants at risk
