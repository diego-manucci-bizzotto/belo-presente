-- Monetization sprint: allow dedicated affiliate links on redirect products.
-- Execute this migration manually in your database environment.

BEGIN;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

COMMIT;

