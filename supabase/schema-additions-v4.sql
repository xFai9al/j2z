-- J2z — Bio page competitive features (featured link, click tracking, fonts, email capture)
-- Run this in Supabase SQL Editor after schema-additions-v3.sql
-- Design context: /office-hours competitive research vs Linktree/Beacons, 2026-07-02

-- ============================================================
-- 1. bio_links: per-link click counter + featured flag
-- Click tracking for bio_links didn't exist before this — external
-- social/custom links were never routed through anything trackable.
-- ============================================================
ALTER TABLE bio_links ADD COLUMN IF NOT EXISTS clicks BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE bio_links ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION increment_bio_link_clicks(p_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE bio_links SET clicks = clicks + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_bio_link_clicks(UUID) TO anon, authenticated;

-- ============================================================
-- 2. bio_pages: font pairing choice + email capture toggle
-- ============================================================
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS font_pairing TEXT DEFAULT 'default';
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS collect_emails BOOLEAN DEFAULT FALSE;

-- ============================================================
-- 3. bio_subscribers — emails collected from a creator's bio page
-- ============================================================
CREATE TABLE IF NOT EXISTS bio_subscribers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bio_page_id UUID REFERENCES bio_pages(id) ON DELETE CASCADE NOT NULL,
  email       TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (bio_page_id, email)
);

CREATE INDEX IF NOT EXISTS idx_bio_subscribers_page ON bio_subscribers(bio_page_id);

ALTER TABLE bio_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bio_subscribers_owner_view" ON bio_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_subscribers.bio_page_id AND bio_pages.user_id = auth.uid())
);
-- No INSERT policy: the public capture form writes via the service-role client
-- (same pattern as anonymous link creation in /api/shorten), not direct anon RLS access.
