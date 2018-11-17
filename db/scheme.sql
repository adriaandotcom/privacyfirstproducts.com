-- -- Create users table
CREATE TABLE IF NOT EXISTS users (
  id              serial primary key,
  name            text,
  email           text not null UNIQUE,
  magic_token     text,
  added           timestamp without time zone default (now() at time zone 'utc'),
  extra           jsonb
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key   text primary key,
  value jsonb
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id           serial primary key,
  slug         text not null UNIQUE,
  name         text,
  description  text,
  url          text,
  image        text,
  category     text,
  updated      timestamp without time zone default (now() at time zone 'utc'),
  extra jsonb
);

CREATE INDEX IF NOT EXISTS index_settings_key ON settings (key);
CREATE INDEX IF NOT EXISTS index_products_category ON products (category);

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text not null UNIQUE;
