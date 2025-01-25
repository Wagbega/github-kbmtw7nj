/*
  # Add Event Type Field

  1. Changes
    - Add type column to events table
    - Update existing events with default types
    - Add check constraint for valid event types

  2. Security
    - Maintain existing RLS policies
*/

-- Add type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'type'
  ) THEN
    ALTER TABLE events ADD COLUMN type text NOT NULL DEFAULT 'Service';

    -- Add check constraint for valid event types
    ALTER TABLE events ADD CONSTRAINT valid_event_type 
      CHECK (type IN ('Service', 'Youth', 'Outreach', 'Workshop', 'Prayer', 'Special'));

    -- Update existing events with appropriate types
    UPDATE events 
    SET type = CASE 
      WHEN LOWER(title) LIKE '%youth%' THEN 'Youth'
      WHEN LOWER(title) LIKE '%prayer%' THEN 'Prayer'
      WHEN LOWER(title) LIKE '%outreach%' THEN 'Outreach'
      WHEN LOWER(title) LIKE '%workshop%' THEN 'Workshop'
      WHEN LOWER(title) LIKE '%special%' THEN 'Special'
      ELSE 'Service'
    END;
  END IF;
END $$;