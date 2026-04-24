-- J2z.com — Complete Database Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com → SQL Editor → New Query)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── Profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  username      TEXT UNIQUE,
  avatar_url    TEXT,
  language      TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  theme         TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]{3,30}$')
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── Links ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS links (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  title           TEXT,
  clicks          BIGINT DEFAULT 0 NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-zA-Z0-9_-]{1,30}$'),
  CONSTRAINT url_format CHECK (destination_url ~* '^https?://.+')
);

CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_created ON links(created_at DESC);


-- ── QR Codes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_codes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  title           TEXT,
  color_fg        TEXT DEFAULT '#2F2A24',
  color_bg        TEXT DEFAULT '#FFFFFF',
  scans           BIGINT DEFAULT 0 NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT qr_slug_format CHECK (slug ~ '^[a-zA-Z0-9_-]{1,30}$'),
  CONSTRAINT qr_url_format CHECK (destination_url ~* '^https?://.+')
);

CREATE INDEX IF NOT EXISTS idx_qr_slug ON qr_codes(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_qr_user ON qr_codes(user_id);


-- ── Bio Pages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bio_pages (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username         TEXT UNIQUE NOT NULL,
  display_name     TEXT,
  bio              TEXT,
  avatar_url       TEXT,
  theme            TEXT DEFAULT 'default',
  background_color TEXT DEFAULT '#2F2A24',
  accent_color     TEXT DEFAULT '#E8765C',
  is_published     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bio_username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$')
);

CREATE INDEX IF NOT EXISTS idx_bio_username ON bio_pages(username) WHERE is_published = true;


-- ── Bio Links ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bio_links (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  icon        TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bio_link_url_format CHECK (url ~* '^https?://.+')
);

CREATE INDEX IF NOT EXISTS idx_bio_links_page ON bio_links(bio_page_id, sort_order);


-- ── Clicks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clicks (
  id            BIGSERIAL PRIMARY KEY,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('link', 'qr', 'bio', 'bio_link')),
  resource_id   UUID NOT NULL,
  country       TEXT,
  city          TEXT,
  device_type   TEXT,
  browser       TEXT,
  os            TEXT,
  referrer      TEXT,
  ip_hash       TEXT,
  user_agent    TEXT,
  clicked_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clicks_resource ON clicks(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_clicks_date ON clicks(clicked_at DESC);


-- ── Anonymous Usage ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anon_usage (
  ip_hash       TEXT PRIMARY KEY,
  links_created INT DEFAULT 0,
  qrs_created   INT DEFAULT 0,
  first_seen    TIMESTAMPTZ DEFAULT NOW(),
  last_seen     TIMESTAMPTZ DEFAULT NOW()
);


-- ── URL Blocklist ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS url_blocklist (
  id           BIGSERIAL PRIMARY KEY,
  pattern      TEXT UNIQUE NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('domain', 'keyword', 'regex')),
  reason       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO url_blocklist (pattern, pattern_type, reason) VALUES
  ('pornhub.com', 'domain', 'adult_content'),
  ('xvideos.com', 'domain', 'adult_content'),
  ('xnxx.com', 'domain', 'adult_content'),
  ('bet365.com', 'domain', 'gambling'),
  ('pokerstars.com', 'domain', 'gambling'),
  ('xxx', 'keyword', 'adult_content'),
  ('porn', 'keyword', 'adult_content'),
  ('casino', 'keyword', 'gambling')
ON CONFLICT (pattern) DO NOTHING;


-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_public_username" ON profiles FOR SELECT USING (username IS NOT NULL);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links_own" ON links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "links_public_active" ON links FOR SELECT USING (is_active = true);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qr_own" ON qr_codes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "qr_public_active" ON qr_codes FOR SELECT USING (is_active = true);

ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bio_pages_own" ON bio_pages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "bio_pages_public" ON bio_pages FOR SELECT USING (is_published = true);

ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bio_links_owner" ON bio_links FOR ALL USING (
  EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_links.bio_page_id AND bio_pages.user_id = auth.uid())
);
CREATE POLICY "bio_links_public" ON bio_links FOR SELECT USING (
  is_active = true AND EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_links.bio_page_id AND bio_pages.is_published = true)
);

ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clicks_owner_view" ON clicks FOR SELECT USING (
  (resource_type = 'link' AND EXISTS (SELECT 1 FROM links WHERE links.id = clicks.resource_id AND links.user_id = auth.uid()))
  OR (resource_type = 'qr' AND EXISTS (SELECT 1 FROM qr_codes WHERE qr_codes.id = clicks.resource_id AND qr_codes.user_id = auth.uid()))
  OR (resource_type IN ('bio','bio_link') AND EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = clicks.resource_id AND bio_pages.user_id = auth.uid()))
);

ALTER TABLE anon_usage ENABLE ROW LEVEL SECURITY;

ALTER TABLE url_blocklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocklist_read" ON url_blocklist FOR SELECT USING (true);


-- ── Helper Functions ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qr_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bio_pages_updated_at BEFORE UPDATE ON bio_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── Analytics Views ───────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW daily_clicks AS
SELECT resource_type, resource_id, DATE_TRUNC('day', clicked_at) AS day, COUNT(*) AS click_count, COUNT(DISTINCT ip_hash) AS unique_clicks
FROM clicks GROUP BY resource_type, resource_id, DATE_TRUNC('day', clicked_at);

CREATE OR REPLACE VIEW clicks_by_country AS
SELECT resource_type, resource_id, country, COUNT(*) AS click_count
FROM clicks WHERE country IS NOT NULL GROUP BY resource_type, resource_id, country ORDER BY click_count DESC;

CREATE OR REPLACE VIEW clicks_by_device AS
SELECT resource_type, resource_id, device_type, COUNT(*) AS click_count
FROM clicks WHERE device_type IS NOT NULL GROUP BY resource_type, resource_id, device_type;


-- ── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE clicks;
ALTER PUBLICATION supabase_realtime ADD TABLE links;
ALTER PUBLICATION supabase_realtime ADD TABLE qr_codes;
