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
  owners       integer [],
  updated      timestamp without time zone default (now() at time zone 'utc'),
  extra jsonb
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id           serial primary key,
  product_id   integer not null REFERENCES products(id) ON DELETE CASCADE,
  user_id      integer not null REFERENCES users(id) ON DELETE CASCADE,
  original_id  integer,
  text         text,
  created      timestamp without time zone default (now() at time zone 'utc')
);

CREATE INDEX IF NOT EXISTS index_settings_key ON settings (key);
CREATE INDEX IF NOT EXISTS index_products_category ON products (category);
CREATE INDEX IF NOT EXISTS index_comments_original_id ON comments (original_id);

ALTER TABLE products ADD COLUMN IF NOT EXISTS owners integer [];
