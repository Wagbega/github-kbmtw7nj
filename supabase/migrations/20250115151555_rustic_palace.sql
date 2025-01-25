/*
  # Add audio sermons table

  1. New Tables
    - `audio_sermons`
      - `id` (uuid, primary key)
      - `title` (text)
      - `date` (timestamptz)
      - `audio_url` (text)
      - `description` (text)
      - `preacher` (text)
      - `duration` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
*/

-- Create audio sermons table
CREATE TABLE IF NOT EXISTS audio_sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date timestamptz NOT NULL,
  audio_url text NOT NULL,
  description text NOT NULL,
  preacher text NOT NULL,
  duration text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy
ALTER TABLE audio_sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audio sermons are viewable by everyone"
  ON audio_sermons
  FOR SELECT
  TO public
  USING (true);

-- Insert initial data safely using DO block
DO $$
BEGIN
  -- Insert audio sermons if they don't exist
  IF NOT EXISTS (SELECT 1 FROM audio_sermons WHERE title = 'Walking in Grace') THEN
    INSERT INTO audio_sermons (title, date, audio_url, description, preacher, duration) VALUES
    ('Walking in Grace', '2024-03-15 10:00:00+00', 'https://example.com/sermon1.mp3', 'Understanding God''s grace in our daily walk', 'Pastor Sarah Johnson', '45:30');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM audio_sermons WHERE title = 'The Heart of Worship') THEN
    INSERT INTO audio_sermons (title, date, audio_url, description, preacher, duration) VALUES
    ('The Heart of Worship', '2024-03-08 10:00:00+00', 'https://example.com/sermon2.mp3', 'Exploring true worship and its impact', 'Pastor Michael Brown', '38:15');
  END IF;
END $$;