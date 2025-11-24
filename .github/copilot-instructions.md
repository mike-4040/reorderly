# Copilot Instructions

## Script Naming Conventions

When creating scripts that perform similar tasks with different behavior for CI/CD, use the `-ci` suffix for the CI-friendly variant.

- Base scripts should auto-fix/modify by default (for development)
- CI scripts should check-only without modifications (use `-ci` suffix)

Example:
- `lint` → runs with `--fix`
- `lint-ci` → runs without `--fix` (fails on errors)
- `format` → runs with `--write`
- `format-ci` → runs with `--check` (fails if formatting needed)

## Documentation Best Practices

When creating or updating technical documentation:

- **Be concise and practical** - Focus on "how to use" rather than "how it works"
- **Remove unnecessary details** - Implementation details belong in config files, not docs
- **Prioritize common use cases** - Document what developers need day-to-day
- **Keep it actionable** - Include examples and commands developers can copy-paste
- **Avoid redundancy** - Don't repeat information that's already in config files or official docs
- **Update as you go** - When adding features, update docs to reflect the simplest way to use them

Good documentation answers: "What do I need to know to use this effectively?"
Bad documentation explains: "Here's every configuration option and its internal workings"

## Error Handling

Use structured error messages with the `functionName_problem` pattern:

```typescript
throw new Error('getRequiredEnv_missingEnvVariable', { 
  cause: { key: 'API_KEY' } 
});
```

- **Message format**: `functionName_problem` (e.g., `validateState_expired`, `exchangeToken_invalidCode`)
- **Context in cause**: Add details via `{ cause: { ... } }` for debugging
- **Benefits**: Easier to parse programmatically, structured logging, clear error origins

## Node.js Imports

Use the `node:` prefix for built-in modules:

```typescript
import { env } from 'node:process';
import { readFile } from 'node:fs/promises';
```

This is the modern Node.js standard and makes it explicit that you're importing from Node.js built-ins, not npm packages.

## Development Workflow

When implementing features or changes:

- **Work in small, incremental steps** - Make one logical change at a time
- **One file at a time** - Unless explicitly asked to work on multiple files, focus on a single file per iteration
- **Commit-ready chunks** - Each step should result in working, testable code
- **Ask before proceeding** - After completing a file or step, confirm before moving to the next

This approach:
- Reduces cognitive load and makes changes easier to review
- Allows for course correction before too much code is written
- Creates cleaner git history with focused commits
- Makes it easier to test and validate each change
