# Square Catalog Items Sync

## Overview

The items sync functionality keeps catalog items synchronized between Square and the local PostgreSQL database. It runs on a scheduled basis to ensure the local catalog stays up-to-date.

## Architecture

### Components

1. **Scheduled Function** (`src/items/scheduled-sync.ts`)
   - Cloud Function that runs daily at 2 AM PST
   - Processes all active merchants in batches
   - Error isolation per merchant

2. **Sync Service** (`src/items/sync.ts`)
   - Core sync logic for individual merchants
   - Fetches catalog items from Square
   - Upserts items to database
   - Marks missing items as deleted

3. **Square Client** (`src/providers/square/client.ts`)
   - Fetches catalog items via Square API
   - Handles pagination automatically
   - Returns all ITEM-type catalog objects

4. **Datastore** (`src/datastore/items.ts`)
   - Database CRUD operations
   - Upsert logic with conflict handling
   - Bulk operations for marking deleted items

## How It Works

### Sync Process

1. **Fetch Active Merchants**
   - Retrieves all non-revoked merchants from database
   - Skips merchants with revoked OAuth tokens

2. **Batch Processing**
   - Processes merchants in batches of 10
   - Uses `Promise.allSettled` for error isolation
   - Logs success/failure counts per batch

3. **Fetch Items from Square**
   - Calls Square Catalog API with `types: 'ITEM'` filter
   - Handles pagination using the Page API
   - Fetches all pages until complete

4. **Sync to Database**
   - Records sync start time
   - Upserts each item (insert or update on conflict)
   - Marks `last_seen_at` timestamp for each item

5. **Mark Stale Items as Deleted**
   - Items not seen since sync start are marked `is_deleted = true`
   - Preserves historical data instead of hard deletes

### Data Mapping

Square catalog items are mapped to the `ItemInput` interface defined in `src/items/types.ts`.

## Database Schema

The items are stored with a unique constraint on `(merchant_id, provider, provider_item_id)` to ensure one item per merchant per provider.

Key fields:

- `is_deleted` - Marks items removed from Square or not seen in recent sync
- `is_available` - Indicates if item is active/sellable (inverse of Square's `isArchived`)
- `last_seen_at` - Timestamp of last sync that included this item
- `raw` - Complete Square payload for debugging and future fields

## Scheduled Execution

The sync runs daily at 2 AM PST:

```typescript
export const scheduledItemsSync = onSchedule(
  {
    schedule: '0 2 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    /* sync logic */
  },
);
```

## Error Handling

### Per-Item Errors

- Items that fail to process are logged and reported to Sentry
- Sync continues with remaining items
- Error count tracked per batch

### Per-Merchant Errors

- Merchant sync failures are isolated using `Promise.allSettled`
- Failed merchants don't block other merchants
- Success/failure counts logged per batch

### Common Errors

**Missing itemData:**

```
mapSquareItemToInput_missingItemData
```

Catalog object doesn't have ITEM type or itemData is missing.

**Sync failed:**

```
syncMerchantItems_failed
```

Complete merchant sync failed - check cause for details.

**Item processing failed:**

```
syncMerchantItems_itemProcessingFailed
```

Individual item couldn't be upserted - check cause for specific item error.

## Testing

### Manual Trigger

Test the sync function locally:

```typescript
import { syncMerchantItems } from './items/sync';

await syncMerchantItems('merchant-id');
```

### Verify Results

Check synced items in the database:

```sql
SELECT id, name, is_deleted, is_available, last_seen_at
FROM items
WHERE merchant_id = 123
ORDER BY name;
```

## Future Enhancements

- **Category sync** - Fetch and store category details separately
- **Variation sync** - Support SKU-level data (ITEM_VARIATION objects)
- **Modifier sync** - Sync modifier lists and options
- **Incremental sync** - Use Square's `updated_at` for delta syncs
- **Webhook support** - Real-time updates instead of scheduled polling
