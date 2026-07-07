-- WUTSHY Portfolio Database Schema
-- Run this in Supabase SQL Editor

-- Works: beats, mixing portfolio, placements
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('beat', 'mixing', 'placement')),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  audio_url TEXT,
  spotify_url TEXT,
  spotify_type TEXT CHECK (spotify_type IN ('track', 'playlist', 'album')),
  tags TEXT[] DEFAULT '{}',
  accent_color TEXT DEFAULT '#facc15',
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drum kits
CREATE TABLE IF NOT EXISTS drum_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  cover_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drum kit tracks
CREATE TABLE IF NOT EXISTS drum_kit_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drum_kit_id UUID REFERENCES drum_kits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT,
  duration_seconds INT,
  sort_order INT DEFAULT 0
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE drum_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE drum_kit_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read works" ON works FOR SELECT USING (true);
CREATE POLICY "Public read drum_kits" ON drum_kits FOR SELECT USING (true);
CREATE POLICY "Public read drum_kit_tracks" ON drum_kit_tracks FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Admin write policies (authenticated users)
CREATE POLICY "Admin insert works" ON works FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update works" ON works FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete works" ON works FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert drum_kits" ON drum_kits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update drum_kits" ON drum_kits FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete drum_kits" ON drum_kits FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert tracks" ON drum_kit_tracks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update tracks" ON drum_kit_tracks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete tracks" ON drum_kit_tracks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admin insert settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update settings" ON site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete settings" ON site_settings FOR DELETE TO authenticated USING (true);

-- Storage bucket for audio and images
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admin upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('hero', '{"title": "Stop settling for generic sounds.", "subtitle": "Beats, mixing, drum kits — crafted to inspire your next session.", "tagline": "Producer & Mix Engineer"}'),
  ('social', '{"instagram": "", "spotify": "", "soundcloud": "", "telegram": ""}')
ON CONFLICT (key) DO NOTHING;
