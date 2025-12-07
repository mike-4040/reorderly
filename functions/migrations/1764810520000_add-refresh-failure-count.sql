-- Up Migration
-- Add refresh failure tracking to merchants table

ALTER TABLE merchants 
ADD COLUMN refresh_failure_count INTEGER NOT NULL DEFAULT 0;

-- Down Migration
ALTER TABLE merchants 
DROP COLUMN refresh_failure_count;
