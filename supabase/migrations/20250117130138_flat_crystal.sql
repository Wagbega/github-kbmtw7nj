/*
  # Create live streams table

  1. New Tables
    - `live_streams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `live_streams` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live streams are viewable by everyone"
  ON live_streams
  FOR SELECT
  TO public
  USING (true);

-- Insert initial data safely using DO block
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM live_streams WHERE name = 'Main Church') THEN
    INSERT INTO live_streams (name, url, description, is_active) VALUES
    ('Main Church', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Live feed from our main church service', true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM live_streams WHERE name = 'English Chapel') THEN
    INSERT INTO live_streams (name, url, description, is_active) VALUES
    ('English Chapel', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Live feed from our English chapel service', true);
  END IF;
END $$;