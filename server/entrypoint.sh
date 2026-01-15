#!/bin/sh
set -e

echo "[backend] Starting entrypoint script..."

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Mask password for logging
MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/(:[^:@]+)@/:*****@/')
echo "[entrypoint] DATABASE_URL: $MASKED_URL"

# Strip Prisma-specific query parameters for psql (psql doesn't understand ?schema=)
PSQL_URL=$(echo "$DATABASE_URL" | sed 's/?.*$//')
echo "[entrypoint] Sanitized URL for psql (removed query params)"

# Check if psql is available
if ! command -v psql >/dev/null 2>&1; then
  echo "[entrypoint] ERROR: psql command not found. postgresql-client is not installed."
  exit 1
fi

# Timeout settings
MAX_RETRIES=${DB_WAIT_MAX_RETRIES:-30}
SLEEP_SECONDS=${DB_WAIT_SLEEP_SECONDS:-2}
RETRY=0

echo "[entrypoint] Waiting for database to be available..."

# Wait for database with error output (use PSQL_URL without query params)
until psql "$PSQL_URL" -c '\q' 2>&1; do
  EXIT_CODE=$?
  RETRY=$((RETRY+1))
  
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "[entrypoint] ERROR: Timeout after $RETRY attempts (exit code: $EXIT_CODE)"
    echo "[entrypoint] Check: docker logs database"
    exit 1
  fi
  
  echo "[entrypoint] Postgres not ready - attempt $RETRY/$MAX_RETRIES (waiting ${SLEEP_SECONDS}s)"
  sleep "$SLEEP_SECONDS"
done

echo "[entrypoint] Database is available"

# Run Prisma migrations using Bun
# We check if 'bun' is available or if the prisma binary exists in node_modules
if command -v bun >/dev/null 2>&1 || [ -f "./node_modules/.bin/prisma" ]; then
  echo "[entrypoint] Running Prisma migrations..."
  
  # Using 'bunx' instead of 'npx'
  if bunx prisma migrate deploy --schema=./prisma/schema.prisma; then
    echo "[entrypoint] Migrations completed successfully"
  else
    EXIT_CODE=$?
    echo "[entrypoint] WARNING: prisma migrate deploy failed (exit code: $EXIT_CODE)"
    # Optional: Exit if you want strict failure on migration error
    # exit 1
  fi
else
  echo "[entrypoint] WARNING: Bun or Prisma CLI not found, skipping migrations"
fi

# Run SQL seed file (use PSQL_URL without query params)
SEED_FILE="./database/foundation.sql"
if [ -f "$SEED_FILE" ]; then
  echo "[entrypoint] Running seed SQL: $SEED_FILE"
  if psql "$PSQL_URL" -f "$SEED_FILE"; then
    echo "[entrypoint] Seed completed successfully"
  else
    EXIT_CODE=$?
    echo "[entrypoint] ERROR: Failed to run seed SQL (exit code: $EXIT_CODE)"
    exit 1
  fi
else
  echo "[entrypoint] INFO: No seed file found at $SEED_FILE, skipping"
fi

# Run SQL seed file (use PSQL_URL without query params)
SEED_FILE="./database/community.sql"
if [ -f "$SEED_FILE" ]; then
  echo "[entrypoint] Running seed community SQL: $SEED_FILE"
  if psql "$PSQL_URL" -f "$SEED_FILE"; then
    echo "[entrypoint] Seed community completed successfully"
  else
    EXIT_CODE=$?
    echo "[entrypoint] ERROR: Failed to run seed SQL (exit code: $EXIT_CODE)"
    exit 1
  fi
else
  echo "[entrypoint] INFO: No seed file found at $SEED_FILE, skipping"
fi

echo "[entrypoint] All initialization complete"
echo "[entrypoint] Starting application: $*"

# Replace shell with the application process
exec "$@"