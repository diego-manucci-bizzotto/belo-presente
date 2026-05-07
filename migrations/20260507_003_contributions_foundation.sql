-- Sprint foundation: direct contributions without product selection.
-- Execute this migration manually in your database environment.

BEGIN;

CREATE TABLE IF NOT EXISTS list_contribution (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
  contributor_name VARCHAR(120) NOT NULL,
  contributor_contact VARCHAR(255),
  message VARCHAR(512),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_list_contribution_list_id_is_active
  ON list_contribution(list_id, is_active);

CREATE INDEX IF NOT EXISTS idx_list_contribution_list_id_created_at
  ON list_contribution(list_id, created_at DESC);

COMMIT;

