-- Up Migration
-- Create items table for storing catalog items from providers (Square, etc.)

CREATE TABLE items (
  -- Internal PK
  id                   BIGSERIAL PRIMARY KEY,

  -- Which merchant this item belongs to
  merchant_id          BIGINT NOT NULL
                       REFERENCES merchants(id)
                       ON DELETE CASCADE,

  -- Which provider this item comes from (Square for now, future-proof)
  provider             TEXT NOT NULL DEFAULT 'square',

  -- Square ITEM catalog_object_id
  provider_item_id     TEXT NOT NULL,

  -- Core item data (not SKU-level)
  name                 TEXT NOT NULL,
  description          TEXT,
  category_id          TEXT,     -- Square CATEGORY id
  category_name        TEXT,     -- denormalized label for simple filters

  -- Lifecycle flags
  is_deleted           BOOLEAN NOT NULL DEFAULT FALSE, -- Square's is_deleted or "missing from latest sync"
  is_available         BOOLEAN NOT NULL DEFAULT TRUE,  -- item is active/sellable

  -- Sync / versioning metadata
  provider_version     BIGINT,                         -- Square catalog version for this object
  provider_updated_at  TIMESTAMPTZ,                    -- from Square's updated_at, if available
  last_seen_at         TIMESTAMPTZ,                    -- when this row was last touched in a full catalog sync

  -- Optional raw Square payload (for debugging / future fields)
  raw                  JSONB,

  -- Timestamps
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One Square ITEM per merchant
CREATE UNIQUE INDEX items_merchant_provider_item_uid
  ON items (merchant_id, provider, provider_item_id);

-- Convenience indexes
CREATE INDEX items_merchant_idx
  ON items (merchant_id);

CREATE INDEX items_merchant_category_idx
  ON items (merchant_id, category_name);

-- Add trigger to auto-update updated_at timestamp
CREATE TRIGGER items_set_updated_at
BEFORE UPDATE ON items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Down Migration
DROP TRIGGER IF EXISTS items_set_updated_at ON items;
DROP TABLE items;
