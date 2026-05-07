BEGIN;

-- 1) List visibility status
ALTER TABLE "list"
  ADD COLUMN IF NOT EXISTS active BOOLEAN;

UPDATE "list"
SET active = TRUE
WHERE active IS NULL;

ALTER TABLE "list"
  ALTER COLUMN active SET DEFAULT TRUE;

ALTER TABLE "list"
  ALTER COLUMN active SET NOT NULL;

-- 2) Product foundation for public sharing and selection
ALTER TABLE product
  ADD COLUMN IF NOT EXISTS quantity INT;

UPDATE product
SET quantity = 1
WHERE quantity IS NULL;

ALTER TABLE product
  ALTER COLUMN quantity SET DEFAULT 1;

ALTER TABLE product
  ALTER COLUMN quantity SET NOT NULL;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS purchase_type TEXT;

UPDATE product
SET purchase_type = 'redirect'
WHERE purchase_type IS NULL;

ALTER TABLE product
  ALTER COLUMN purchase_type SET DEFAULT 'redirect';

ALTER TABLE product
  ALTER COLUMN purchase_type SET NOT NULL;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN;

UPDATE product
SET is_active = TRUE
WHERE is_active IS NULL;

ALTER TABLE product
  ALTER COLUMN is_active SET DEFAULT TRUE;

ALTER TABLE product
  ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10);

UPDATE product
SET currency = 'BRL'
WHERE currency IS NULL;

ALTER TABLE product
  ALTER COLUMN currency SET DEFAULT 'BRL';

ALTER TABLE product
  ALTER COLUMN currency SET NOT NULL;

-- 3) Gift intents created by guests
CREATE TABLE IF NOT EXISTS gift_intent (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  guest_name VARCHAR(120) NOT NULL,
  guest_phone VARCHAR(30) NOT NULL,
  guest_message VARCHAR(512),
  purchase_type TEXT NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'BRL' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) Dashboard guests (RSVP management)
CREATE TABLE IF NOT EXISTS guest (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  note VARCHAR(512),
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 5) Per-list feature flags
CREATE TABLE IF NOT EXISTS list_feature_flags (
  list_id BIGINT PRIMARY KEY REFERENCES "list"(id) ON DELETE CASCADE,
  attendance_confirmation_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  notes_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  contributions_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  share_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  selection_notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL
);

-- 6) Public/owner notes
CREATE TABLE IF NOT EXISTS list_note (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
  author_name VARCHAR(120) NOT NULL,
  author_contact VARCHAR(255),
  message VARCHAR(512) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 7) Selection events for notification history
CREATE TABLE IF NOT EXISTS list_selection_event (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  product_name VARCHAR(100) NOT NULL,
  guest_name VARCHAR(120) NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_product_list_id_is_active
  ON product(list_id, is_active);

CREATE INDEX IF NOT EXISTS idx_gift_intent_product_id
  ON gift_intent(product_id);

CREATE INDEX IF NOT EXISTS idx_guest_list_id_is_active
  ON guest(list_id, is_active);

CREATE INDEX IF NOT EXISTS idx_list_note_list_id_is_active
  ON list_note(list_id, is_active);

CREATE INDEX IF NOT EXISTS idx_list_selection_event_list_id_created_at
  ON list_selection_event(list_id, created_at DESC);

COMMIT;
