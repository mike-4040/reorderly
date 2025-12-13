-- Up Migration
-- Create users table to store user data previously in Firestore

CREATE TABLE users (
  -- Firebase Auth UID as primary key (TEXT since it's from Firebase)
  id                            TEXT PRIMARY KEY,
  
  -- Merchant relationship
  merchant_id                   BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- User metadata
  account_setup_complete        BOOLEAN NOT NULL DEFAULT false,
  provider_user_id              TEXT,
  role                          TEXT NOT NULL DEFAULT 'staff',
  
  -- Email verification tracking
  email_verified_at             TIMESTAMPTZ,
  email_verification_sent_at    TIMESTAMPTZ,
  password_set_at               TIMESTAMPTZ,
  
  -- Timestamps
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (role IN ('owner', 'admin', 'manager', 'staff'))
);

-- Indexes
CREATE INDEX idx_users_merchant_id ON users(merchant_id);
CREATE INDEX idx_users_merchant_provider ON users(merchant_id, provider_user_id) WHERE provider_user_id IS NOT NULL;

-- Updated_at trigger
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
DROP INDEX IF EXISTS idx_users_merchant_provider;
DROP INDEX IF EXISTS idx_users_merchant_id;
DROP TABLE IF EXISTS users;
