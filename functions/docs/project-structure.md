# Project Structure

```
functions/src/
├── index.ts              # Entry point - exports all HTTP functions
├── utils/                # Shared utilities
│   ├── config.ts         # Environment configuration (lazy-loaded)
│   ├── error-handler.ts  # Error handling and custom error classes
│   └── firestore.ts      # Firestore initialization (OAuth states only)
├── datastore/            # Database layer (PostgreSQL)
│   ├── merchants.ts      # Merchant database queries
│   ├── items.ts          # Item database queries
│   ├── users.ts          # User database queries
│   ├── mappers.ts        # Row-to-domain model converters
│   └── types/            # Generated database types
├── oauth/                # OAuth providers
│   ├── shared/           # Shared OAuth utilities (state, tokens, audit)
│   └── square/           # Square-specific implementation
├── merchants/            # Merchant domain logic
│   ├── types.ts          # Merchant data models
│   ├── service.ts        # Business logic
│   ├── token-refresh.ts  # Token refresh service
│   └── scheduled-refresh.ts  # Scheduled token refresh function
├── items/                # Catalog items domain logic
│   ├── types.ts          # Item data models
│   ├── sync.ts           # Item sync service
│   └── scheduled-sync.ts # Scheduled item sync function
├── providers/            # External provider integrations
│   └── square/           # Square API client
│       └── client.ts     # Merchant & catalog API calls
└── docs/                 # Documentation
```

## Conventions

- **One concern per directory** - Each folder has a single responsibility
- **Types in separate files** - `types.ts` in each module
- **Provider-specific code** - Keep provider implementations isolated (e.g., `oauth/square/`)
- **Shared code in utils** - Generic utilities go in `utils/`

## Adding New Features

- **New OAuth provider**: Create `oauth/{provider}/` directory
- **New entity**: Create new top-level directory (e.g., `orders/`)
- **Shared utilities**: Add to `utils/`
- **HTTP functions**: Export from `index.ts`
