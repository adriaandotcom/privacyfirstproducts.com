-- -- Create users table
-- CREATE TABLE IF NOT EXISTS users (
--   id              serial primary key,
--   name            text,
--   email           text not null UNIQUE,
--   -- added           timestamp without time zone default (now() at time zone 'utc'),
--   extra           jsonb
-- );

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key   text primary key,
  value jsonb
);

CREATE INDEX IF NOT EXISTS index_settings_key ON settings (key);


-- Add indexes
-- CREATE INDEX IF NOT EXISTS index_visits_referrer ON visits (referrer);
