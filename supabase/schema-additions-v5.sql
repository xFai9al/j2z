-- ============================================================
-- Schema Additions v5 — run in Supabase SQL editor
--
-- Fixes the clicks RLS policy: bio_link clicks store bio_links.id
-- in resource_id, but the old policy compared it against
-- bio_pages.id — so owners could never see their bio-link clicks
-- in the analytics API.
-- ============================================================

DROP POLICY IF EXISTS "clicks_owner_view" ON clicks;
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
