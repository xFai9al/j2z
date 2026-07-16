-- J2z security hardening: least-privilege RLS and atomic rate limits.

DROP POLICY IF EXISTS "profiles_public_username" ON public.profiles;
DROP POLICY IF EXISTS "links_public_active" ON public.links;
DROP POLICY IF EXISTS "qr_public_active" ON public.qr_codes;

ALTER VIEW IF EXISTS public.daily_clicks SET (security_invoker = true);
ALTER VIEW IF EXISTS public.clicks_by_country SET (security_invoker = true);
ALTER VIEW IF EXISTS public.clicks_by_device SET (security_invoker = true);
REVOKE ALL ON public.daily_clicks, public.clicks_by_country, public.clicks_by_device FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  key_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (key_hash, action, window_start)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_rate_limits FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated ON public.api_rate_limits(updated_at);

CREATE OR REPLACE FUNCTION public.claim_rate_limit(
  p_key TEXT,
  p_action TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_window TIMESTAMPTZ;
  v_allowed BOOLEAN := FALSE;
BEGIN
  IF p_key IS NULL OR p_action IS NULL OR p_limit < 1 OR p_window_seconds < 1 THEN
    RETURN FALSE;
  END IF;

  v_window := to_timestamp(
    floor(extract(epoch FROM clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.api_rate_limits (key_hash, action, window_start, request_count)
  VALUES (p_key, left(p_action, 160), v_window, 1)
  ON CONFLICT (key_hash, action, window_start) DO UPDATE
    SET request_count = public.api_rate_limits.request_count + 1,
        updated_at = NOW()
    WHERE public.api_rate_limits.request_count < p_limit
  RETURNING TRUE INTO v_allowed;

  RETURN COALESCE(v_allowed, FALSE);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

ALTER FUNCTION public.track_click(TEXT, UUID, TEXT, TEXT, TEXT, TEXT)
  SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.track_click(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_click(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.increment_bio_link_clicks(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.bio_links AS bl
  SET clicks = bl.clicks + 1
  WHERE bl.id = p_id
    AND bl.is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM public.bio_pages AS bp
      WHERE bp.id = bl.bio_page_id AND bp.is_published = TRUE
    );
END;
$$;

REVOKE ALL ON FUNCTION public.increment_bio_link_clicks(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_bio_link_clicks(UUID) TO service_role;
