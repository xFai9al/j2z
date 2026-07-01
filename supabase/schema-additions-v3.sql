-- J2z — Hardening pass: multi-admin, anon rate limiting, bio field caps
-- Run this in Supabase SQL Editor after schema.sql + schema-additions.sql + schema-additions-v2.sql
-- Design doc: office-hours session 2026-07-01

-- ============================================================
-- 1. admin_users — replaces hardcoded ADMIN_EMAIL checks
-- Flat allowlist (no role column yet — add one if a second admin
-- tier is ever actually needed).
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  added_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No policies: only the service-role client reads/writes this table.

-- Seed the existing hardcoded admin so access isn't lost on migration.
INSERT INTO admin_users (id)
SELECT id FROM auth.users WHERE email = 'faisal@aba-alkhail.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. anon_usage — add daily bucketing so limits reset instead of
-- accumulating forever. ip_hash was already unique, so widening
-- the primary key to (ip_hash, usage_date) is a safe, non-colliding
-- change on this single-column-PK table.
-- ============================================================
ALTER TABLE anon_usage ADD COLUMN IF NOT EXISTS usage_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE anon_usage DROP CONSTRAINT IF EXISTS anon_usage_pkey;
ALTER TABLE anon_usage ADD PRIMARY KEY (ip_hash, usage_date);

-- ============================================================
-- 3. bio_pages CHECK constraints — schema is the single source of
-- truth for max length, not just the UI. Run a manual SELECT first
-- if you're worried about existing rows:
--   SELECT id, username FROM bio_pages
--   WHERE length(display_name) > 60 OR length(bio) > 160
--      OR length(bg_image_url) > 500 OR length(avatar_url) > 500;
-- ============================================================
ALTER TABLE bio_pages ADD CONSTRAINT bio_display_name_len CHECK (char_length(display_name) <= 60);
ALTER TABLE bio_pages ADD CONSTRAINT bio_bio_len CHECK (char_length(bio) <= 160);
ALTER TABLE bio_pages ADD CONSTRAINT bio_bg_image_url_len CHECK (char_length(bg_image_url) <= 500);
ALTER TABLE bio_pages ADD CONSTRAINT bio_avatar_url_len CHECK (char_length(avatar_url) <= 500);
