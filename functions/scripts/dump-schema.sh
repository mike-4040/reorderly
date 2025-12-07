#!/usr/bin/env bash
#
# Dump database schema (tables only) to migrations/schema.sql
#
# This script dumps only table definitions
#

set -e

CONTAINER_NAME="reorderly-postgres"
DB_USER="postgres"
DB_NAME="reorderly"
OUTPUT_FILE="migrations/schema.sql"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Error: Container '$CONTAINER_NAME' is not running"
  echo "Start it with: docker compose up -d"
  exit 1
fi

echo "Dumping schema from $CONTAINER_NAME..."

docker exec "$CONTAINER_NAME" pg_dump \
  -U "$DB_USER" \
  --schema-only \
  --no-owner \
  --no-privileges \
  -n 'public' \
  --exclude-table-data='*' \
  "$DB_NAME" \
  | sed \
    -e '/^ALTER FUNCTION/,/^$/d' \
    -e '/^ALTER SEQUENCE/,/^$/d' \
    -e '/^ALTER TABLE/,/;$/d' \
    -e '/^COMMENT ON/d' \
    -e '/^CREATE FUNCTION/,/^\$\$/d' \
    -e '/^CREATE INDEX/d' \
    -e '/^CREATE SEQUENCE/,/^$/d' \
    -e '/^CREATE SCHEMA/d' \
    -e '/^CREATE TRIGGER/,/^$/d' \
    -e '/^SELECT /d' \
    -e '/^SET /d' \
    -e '/^--/d' \
    -e '/^$/d' \
    -e '/^\\restrict/d' \
    -e '/^\\unrestrict/d' \
  > "$OUTPUT_FILE"

echo "Schema dumped to $OUTPUT_FILE"
