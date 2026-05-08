ALTER TABLE list
ADD COLUMN background_theme TEXT NOT NULL DEFAULT 'waves_sides';

ALTER TABLE list
ADD CONSTRAINT list_background_theme_check
CHECK (background_theme IN ('waves_sides', 'waves_top', 'solid'));
