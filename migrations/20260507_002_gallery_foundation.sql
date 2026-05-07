-- Sprint 4 foundation: gallery items for dashboard and shared pages.
-- Execute this migration manually in your database environment.

BEGIN;

CREATE TABLE IF NOT EXISTS list_gallery_item (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES list(id),
  image_url TEXT NOT NULL,
  caption VARCHAR(255) NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_list_gallery_item_list_active_order
  ON list_gallery_item(list_id, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_list_gallery_item_list_created_at
  ON list_gallery_item(list_id, created_at DESC);

COMMIT;

