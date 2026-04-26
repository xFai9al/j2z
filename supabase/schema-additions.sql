-- J2z — Schema Additions
-- Run this in Supabase SQL Editor if you already ran schema.sql
-- Fixes: profiles trigger + track_click function

-- ============================================================
-- FIX 1: profiles table has email NOT NULL from old schema
-- Make email nullable so the signup trigger doesn't fail
-- ============================================================
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- ============================================================
-- FIX 2: Update handle_new_user trigger to populate email
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, language, theme)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'en',
    'light'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FIX 3: track_click function for anonymous click tracking
-- ============================================================
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

  IF NOT COALESCE(v_active, FALSE) THEN
    RETURN;
  END IF;

  INSERT INTO clicks (resource_type, resource_id, country, device_type, referrer, user_agent)
  VALUES (p_resource_type, p_resource_id, p_country, p_device_type, p_referrer, p_user_agent);

  IF p_resource_type = 'link' THEN
    UPDATE links SET clicks = clicks + 1 WHERE id = p_resource_id;
  ELSIF p_resource_type = 'qr' THEN
    UPDATE qr_codes SET scans = scans + 1 WHERE id = p_resource_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION track_click(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
