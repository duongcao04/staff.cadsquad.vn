# README: Seeding Cadsquad DB

A guide on how to use `seed.sql` to populate the PostgreSQL database.

## 1. Prerequisites

- PostgreSQL 13+
- `psql` CLI or any SQL client (DBeaver, TablePlus, etc.)
- A database with the Prisma schema already migrated.
- A valid `DATABASE_URL` in your `.env` file.

## 2. One-time DB setup

Enable the `pgcrypto` extension for `gen_random_uuid()`:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 3. What the script does

- **Upserts reference data:**
    - `Department` (code-based upsert)
    - `JobStatus` (code-based upsert)
    - `JobTitle` (code-based upsert)
    - `JobType` (simple insert)
    - `PaymentChannel` (simple insert)
    - `User` (email-based upsert)
- **Creates 50 random `Job` rows:**
    - Randomly picks existing `JobType`, `JobStatus`, `User`, and `PaymentChannel`.
    - Generates job numbers in the format `<type.code>.<4-digits>`.
    - Generates random `displayName`, `clientName`, `incomeCost`, `staffCost`, and `dueAt`.

> **Note:** This script does not add assignees to jobs.

## 4. Running the seed

### Option A: Using `psql`

```bash
psql "$DATABASE_URL" -f seed.sql
```

### Option B: Inline

```bash
psql "$DATABASE_URL" <<'SQL'
-- (paste the entire content of seed.sql here)
SQL
```

### Option C: GUI Client

Open `seed.sql` in your SQL client and run it.

## 5. Verifying the result

### Quick checks:

```sql
-- Reference data present?
SELECT COUNT(*) AS departments FROM "Department";
SELECT COUNT(*) AS statuses    FROM "JobStatus";
SELECT COUNT(*) AS titles      FROM "JobTitle";
SELECT COUNT(*) AS types       FROM "JobType";
SELECT COUNT(*) AS channels    FROM "PaymentChannel";
SELECT COUNT(*) AS users       FROM "User";

-- Jobs created?
SELECT COUNT(*) AS jobs FROM "Job";

-- Sample of job numbers in dot format
SELECT no FROM "Job" ORDER BY "createdAt" DESC LIMIT 10;

-- Highest sequence per type
SELECT jt.code, MAX((regexp_replace(j.no, '.*\.', ''))::int) AS max_suffix
FROM "Job" j
JOIN "JobType" jt ON jt.id = j."typeId"
GROUP BY jt.code
ORDER BY jt.code;
```

## 6. Re-running behavior & resets

- Re-running adds 50 more jobs.
- Reference rows are updated in place.
- To reset jobs and start job numbers over:
    ```sql
    DELETE FROM "Job";
    -- If you had assignees, also clear the join table:
    -- DELETE FROM "_JobToUser";
    ```

## 7. Common tweaks

- **Change job batch size:** Edit `FOR i IN 1..50 LOOP` in the PL/pgSQL block.
- **Make `JobType` upsert:**
    ```sql
    INSERT INTO "JobType"(...) VALUES (...)
    ON CONFLICT (code) DO UPDATE
    SET "displayName" = EXCLUDED."displayName",
        "updatedAt"   = NOW();
    ```
- **Switch to `uuid-ossp`:** Replace `gen_random_uuid()` with `uuid_generate_v4()` and run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.
- **Prevent creating Jobs if prerequisites are missing:** Add guards at the top of the script.

## 8. Troubleshooting

- **`function gen_random_uuid() does not exist`**: Enable the extension: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- **Unique constraint on `Job.no`**: The script is not designed for concurrent execution.
- **Foreign key errors**: Ensure reference tables are seeded first.
- **Emoji/Unicode names**: Database encoding should be UTF-8.
