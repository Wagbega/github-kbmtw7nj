/*
  # Add admin column to profiles table

  1. Changes
    - Add is_admin column to profiles table with default value false
    - Add index on is_admin column for faster queries
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
    CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
  END IF;
END $$;