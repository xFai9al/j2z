-- J2z — Schema Additions
-- Run this in Supabase SQL Editor if you already ran schema.sql
-- Adds: track_click function for secure anonymous click tracking

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
  -- Only track clicks on active resources
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
