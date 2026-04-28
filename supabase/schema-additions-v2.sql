-- Bio page Linktree-equivalent upgrade
-- Run this in Supabase SQL editor

-- New columns on bio_pages for appearance customization
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'glass';
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '';
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT '';
ALTER TABLE bio_pages ADD COLUMN IF NOT EXISTS bg_image_url TEXT;

-- New column on bio_links for social platform type
ALTER TABLE bio_links ADD COLUMN IF NOT EXISTS platform TEXT;

-- Update existing rows to have default button_style
UPDATE bio_pages SET button_style = 'glass' WHERE button_style IS NULL;
