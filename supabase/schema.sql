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
  button_style     TEXT DEFAULT 'glass',
  button_color     TEXT,
  button_text_color TEXT,
  bg_image_url     TEXT,
  font_pairing     TEXT DEFAULT 'default',
  collect_emails   BOOLEAN DEFAULT FALSE,
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
  platform    TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  clicks      BIGINT DEFAULT 0 NOT NULL,
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
  ip_hash       TEXT,
  usage_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  links_created INT DEFAULT 0,
  qrs_created   INT DEFAULT 0,
  first_seen    TIMESTAMPTZ DEFAULT NOW(),
  last_seen     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ip_hash, usage_date)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bio_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (bio_page_id, email)
);
CREATE INDEX IF NOT EXISTS idx_bio_subscribers_page ON bio_subscribers(bio_page_id);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  key_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key_hash, action, window_start)
);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated ON api_rate_limits(updated_at);


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

ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links_own" ON links FOR ALL USING (auth.uid() = user_id);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qr_own" ON qr_codes FOR ALL USING (auth.uid() = user_id);

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
  OR (resource_type = 'bio' AND EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = clicks.resource_id AND bio_pages.user_id = auth.uid()))
  OR (resource_type = 'bio_link' AND EXISTS (
    SELECT 1 FROM bio_links
    JOIN bio_pages ON bio_pages.id = bio_links.bio_page_id
    WHERE bio_links.id = clicks.resource_id AND bio_pages.user_id = auth.uid()
  ))
);

ALTER TABLE anon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

ALTER TABLE bio_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bio_subscribers_owner_view" ON bio_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_subscribers.bio_page_id AND bio_pages.user_id = auth.uid())
);

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
CREATE OR REPLACE VIEW daily_clicks WITH (security_invoker = true) AS
SELECT resource_type, resource_id, DATE_TRUNC('day', clicked_at) AS day, COUNT(*) AS click_count, COUNT(DISTINCT ip_hash) AS unique_clicks
FROM clicks GROUP BY resource_type, resource_id, DATE_TRUNC('day', clicked_at);

CREATE OR REPLACE VIEW clicks_by_country WITH (security_invoker = true) AS
SELECT resource_type, resource_id, country, COUNT(*) AS click_count
FROM clicks WHERE country IS NOT NULL GROUP BY resource_type, resource_id, country ORDER BY click_count DESC;

CREATE OR REPLACE VIEW clicks_by_device WITH (security_invoker = true) AS
SELECT resource_type, resource_id, device_type, COUNT(*) AS click_count
FROM clicks WHERE device_type IS NOT NULL GROUP BY resource_type, resource_id, device_type;


-- ── Click Tracking Function ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION track_click(
  p_resource_type TEXT,
  p_resource_id   UUID,
  p_country       TEXT DEFAULT NULL,
  p_device_type   TEXT DEFAULT NULL,
  p_referrer      TEXT DEFAULT NULL,
  p_user_agent    TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_active BOOLEAN := FALSE;
BEGIN
  IF p_resource_type = 'link' THEN
    SELECT is_active INTO v_active FROM links WHERE id = p_resource_id LIMIT 1;
  ELSIF p_resource_type = 'qr' THEN
    SELECT is_active INTO v_active FROM qr_codes WHERE id = p_resource_id LIMIT 1;
  ELSIF p_resource_type = 'bio' THEN
    SELECT is_published INTO v_active FROM bio_pages WHERE id = p_resource_id LIMIT 1;
  END IF;

  IF NOT COALESCE(v_active, FALSE) THEN RETURN; END IF;

  INSERT INTO clicks (resource_type, resource_id, country, device_type, referrer, user_agent)
  VALUES (p_resource_type, p_resource_id, p_country, p_device_type, p_referrer, p_user_agent);

  IF p_resource_type = 'link' THEN
    UPDATE links SET clicks = clicks + 1 WHERE id = p_resource_id;
  ELSIF p_resource_type = 'qr' THEN
    UPDATE qr_codes SET scans = scans + 1 WHERE id = p_resource_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION track_click(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION track_click(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION increment_bio_link_clicks(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE bio_links bl SET clicks = bl.clicks + 1
  WHERE bl.id = p_id AND bl.is_active = TRUE
    AND EXISTS (SELECT 1 FROM bio_pages bp WHERE bp.id = bl.bio_page_id AND bp.is_published = TRUE);
END;
$$;
REVOKE ALL ON FUNCTION increment_bio_link_clicks(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_bio_link_clicks(UUID) TO service_role;

CREATE OR REPLACE FUNCTION claim_rate_limit(p_key TEXT, p_action TEXT, p_limit INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_window TIMESTAMPTZ; v_allowed BOOLEAN := FALSE;
BEGIN
  IF p_key IS NULL OR p_action IS NULL OR p_limit < 1 OR p_window_seconds < 1 THEN RETURN FALSE; END IF;
  v_window := to_timestamp(floor(extract(epoch FROM clock_timestamp()) / p_window_seconds) * p_window_seconds);
  INSERT INTO api_rate_limits (key_hash, action, window_start, request_count)
  VALUES (p_key, left(p_action, 160), v_window, 1)
  ON CONFLICT (key_hash, action, window_start) DO UPDATE
    SET request_count = api_rate_limits.request_count + 1, updated_at = NOW()
    WHERE api_rate_limits.request_count < p_limit
  RETURNING TRUE INTO v_allowed;
  RETURN COALESCE(v_allowed, FALSE);
END;
$$;
REVOKE ALL ON FUNCTION claim_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

REVOKE ALL ON daily_clicks, clicks_by_country, clicks_by_device FROM anon, authenticated;
REVOKE ALL ON api_rate_limits FROM anon, authenticated;


-- ── Realtime ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE clicks;
ALTER PUBLICATION supabase_realtime ADD TABLE links;
ALTER PUBLICATION supabase_realtime ADD TABLE qr_codes;
