# Scheduled Cloud Functions

## Configuration

Use cron format with explicit timezone for scheduled functions:

```typescript
import { onSchedule } from 'firebase-functions/scheduler';

export const scheduledJob = onSchedule(
  {
    schedule: '0 0 * * *', // Cron format: daily at midnight
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    // Job logic
  },
);
```

**Why:**

- Cron format (`'0 0 * * *'`) is more precise than interval strings (`'every 24 hours'`)
- Explicit timezone prevents ambiguity across deployments
- Standard cron syntax is widely understood

## Common Schedules

```typescript
'0 0 * * *'; // Daily at midnight
'0 */6 * * *'; // Every 6 hours
'0 0 * * 0'; // Weekly on Sunday at midnight
'0 9 * * 1-5'; // Weekdays at 9 AM
```

## Example

```typescript
export const dailyTokenRefresh = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    console.log('Starting scheduled token refresh');

    try {
      const items = await getItemsToProcess();
      // Process items...

      console.log('Scheduled refresh completed');
    } catch (error) {
      captureException(error);
      throw error; // Let Cloud Functions track failures
    }
  },
);
```

**See also:** [batch-processing.md](./batch-processing.md) for handling large datasets in scheduled jobs.
