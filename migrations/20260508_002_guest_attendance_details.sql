ALTER TABLE guest
  ADD COLUMN IF NOT EXISTS attendee_type TEXT NOT NULL DEFAULT 'adult',
  ADD COLUMN IF NOT EXISTS has_companion BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS companion_name VARCHAR(120);

UPDATE guest
SET attendee_type = 'adult'
WHERE attendee_type IS NULL;

UPDATE guest
SET has_companion = FALSE
WHERE has_companion IS NULL;

UPDATE guest
SET companion_name = NULL
WHERE has_companion = FALSE;

ALTER TABLE guest
  DROP CONSTRAINT IF EXISTS guest_attendee_type_check;

ALTER TABLE guest
  ADD CONSTRAINT guest_attendee_type_check
  CHECK (attendee_type IN ('adult', 'child'));

ALTER TABLE guest
  DROP CONSTRAINT IF EXISTS guest_companion_name_check;

ALTER TABLE guest
  ADD CONSTRAINT guest_companion_name_check
  CHECK (
    (has_companion = FALSE AND companion_name IS NULL)
    OR
    (has_companion = TRUE AND companion_name IS NOT NULL AND LENGTH(TRIM(companion_name)) > 0)
  );
