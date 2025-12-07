# Batch Processing Patterns

## Error Isolation with Promise.allSettled

When processing independent items in batches, use `Promise.allSettled` to prevent one failure from affecting others:

```typescript
const BATCH_SIZE = 50;

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);

  const results = await Promise.allSettled(batch.map((item) => processItem(item)));

  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value).length;
  const failed = results.filter((r) => r.status === 'rejected' || !r.value).length;

  console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${succeeded} succeeded, ${failed} failed`);
}
```

**Why:**

- Each item processes independently
- Failures are isolated - one error doesn't stop the batch
- Provides clear success/failure statistics
- Better observability for large operations

## Boolean Returns for Observability

For batch operations, prefer returning boolean success indicators over throwing errors:

```typescript
// ✅ CORRECT - Return boolean for stats
async function processItem(id: string): Promise<boolean> {
  try {
    await doWork(id);
    return true;
  } catch (error) {
    captureException(error);
    return false; // Don't throw - let batch continue
  }
}

// ❌ WRONG - Throws break Promise.allSettled benefits
async function processItem(id: string): Promise<void> {
  await doWork(id); // Throws on error
}
```

**Benefits:**

- Accurate success/failure counting in batch stats
- Errors still tracked via `captureException`
- Batch processing continues despite failures
- Clear separation: `status === 'fulfilled' && value === true` = success

## Comparison: Promise.all vs Promise.allSettled

```typescript
// ❌ Promise.all - fails entire batch on first error
try {
  await Promise.all(batch.map((item) => processItem(item)));
} catch (error) {
  // All remaining items are cancelled
}

// ✅ Promise.allSettled - processes all items independently
const results = await Promise.allSettled(batch.map((item) => processItem(item)));
// All items attempted, individual results available
```

## Complete Example

```typescript
import { getMerchantsNeedingRefresh } from '../datastore/merchants.js';
import { refreshMerchantToken } from './token-refresh.js';

export async function processMerchants() {
  const merchants = await getMerchantsNeedingRefresh();
  console.log(`Processing ${merchants.length} merchants`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < merchants.length; i += BATCH_SIZE) {
    const batch = merchants.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((m) => refreshMerchantToken(m.id, m.refreshToken)),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter((r) => r.status === 'rejected' || !r.value).length;

    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${succeeded} succeeded, ${failed} failed`,
    );
  }
}
```

## When to Use

**Use `Promise.allSettled` + boolean returns when:**

- Processing independent items (database records, API calls)
- Need observability (success/failure counts)
- Failures should not stop other items
- Running scheduled batch jobs

**Use `Promise.all` when:**

- Operations are dependent on each other
- Any failure should stop the entire operation
- All-or-nothing semantics required
