-- Up Migration
-- Flatten merchants schema to match the updated Firestore structure

-- Drop existing merchants table and recreate with flattened schema
DROP TABLE IF EXISTS merchants;

CREATE TABLE merchants (
  id                      BIGSERIAL PRIMARY KEY,
  name                    TEXT NOT NULL,
  provider                TEXT NOT NULL,
  provider_merchant_id    TEXT NOT NULL,
  
  -- Token fields (flattened)
  access_token            TEXT NOT NULL,
  refresh_token           TEXT NOT NULL,
  token_expires_at        TIMESTAMPTZ NOT NULL,
  token_scopes            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  
  -- Locations stored as JSONB array (complex nested structure)
  locations               JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata fields (flattened)
  connected_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_refreshed_at       TIMESTAMPTZ,
  revoked                 BOOLEAN NOT NULL DEFAULT false,
  scopes_mismatch         BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed    BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_provider_merchant UNIQUE (provider, provider_merchant_id)
);

-- Indexes
CREATE INDEX idx_merchants_provider_merchant_id ON merchants(provider, provider_merchant_id);
CREATE INDEX idx_merchants_revoked ON merchants(revoked) WHERE revoked = true;

-- Updated_at trigger (reuse existing function)
CREATE TRIGGER merchants_set_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS merchants_set_updated_at ON merchants;
DROP INDEX IF EXISTS idx_merchants_revoked;
DROP INDEX IF EXISTS idx_merchants_provider_merchant_id;
DROP TABLE IF EXISTS merchants;
