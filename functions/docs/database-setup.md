# Database Setup

## PostgreSQL with Docker

The project uses PostgreSQL 18 for data storage. A Docker Compose configuration is provided for local development.

### Start PostgreSQL locally

```bash
docker compose up -d
```

This starts PostgreSQL on port 3310 with:

- User: `postgres`
- Password: `postgres`
- Database: `reorderly`

### Stop PostgreSQL

```bash
docker compose down
```

### Reset database (delete all data)

```bash
docker compose down -v
docker compose up -d
```

## Migrations

The project uses `node-pg-migrate` for database schema migrations. Migration files are stored in `migrations/` directory.

### Environment Configuration

Database connection strings are managed via Doppler:

- **dev**: Local PostgreSQL (localhost:3310)
- **stg**: Staging database
- **prd**: Production database

Each environment has a `POSTGRES_URL` variable set in Doppler.

### Creating Migrations

Create a new SQL migration file:

```bash
npx node-pg-migrate create migration-name --migration-file-language sql
```

This creates a new file in `migrations/` with the format: `[timestamp]_migration-name.sql`

Edit the file and add your SQL statements after the `-- Up Migration` comment.

### Running Migrations

Run migrations in each environment:

```bash
# Development (local)
npm run migrate

# Rollback last migration (development only)
npm run migrate-down

# Staging
npm run migrate-stg

# Production
npm run migrate-prd
```

All migration commands:

- Pull database URL from Doppler for the specific environment
- Run `node-pg-migrate up` to apply pending migrations (or `down` for rollback)
- Track applied migrations in the `pgmigrations` table

**Note:** Down migrations are only available in development for local iteration. Staging and production only support forward migrations.

### Migration Best Practices

- **Use SQL files** for straightforward schema changes
- **Never edit applied migrations** - create a new migration instead
- **Down migrations for local dev only** - use `npm run migrate-down` to rollback during development
- **No rollbacks in production** - staging and production only migrate forward
- **Test in dev first** - always run `npm run migrate` locally before staging/production
- **Use `IF NOT EXISTS`** when appropriate to make migrations idempotent

### Example Migration

```sql
-- Up Migration
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Down Migration
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;
```

**Note:** In the down migration, drop dependent objects (indexes, triggers) before dropping the table.

## Querying the Database

### PostgreSQL Client

The project uses a connection pool for database queries, located in `src/clients/postgres.ts`. The pool is lazily initialized to prevent issues during Firebase deployment.

```typescript
import { getPgPool } from './clients/postgres.js';

const pool = getPgPool();
const result = await pool.query('SELECT * FROM merchants WHERE id = $1', [id]);
```

### Auto-Generated Types

TypeScript types are automatically generated from the database schema using Supabase CLI. This ensures type safety and keeps types in sync with the database.

**Generate types:**

```bash
npm run db-types
```

This generates `src/datastore/types/generated.ts` with types for all tables.

**When to regenerate:**

- After running migrations that modify schema
- When tables or columns are added/removed/modified
- After type changes

**Usage:**

```typescript
import { Database } from './datastore/types/generated.js';

type MerchantRow = Database['public']['Tables']['merchants']['Row'];
```

The generated file should **not** be manually edited - regenerate it after schema changes.

### Centralized Datastore

All database queries are centralized in `src/datastore/postgres.ts` for consistency and maintainability.

Example:

```typescript
import { getMerchantById } from './datastore/postgres.js';

const merchant = await getMerchantById('123');
```

When adding new queries, add them to the datastore file with:

- Generated types for row results
- Parameterized queries to prevent SQL injection
- JSDoc comments explaining the query's purpose
