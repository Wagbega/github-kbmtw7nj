/*
  # Update profiles, prayer requests, and testimonies tables

  1. Changes
    - Add safety checks for existing policies
    - Ensure clean policy creation
    - Maintain existing table structure
  
  2. Security
    - Maintain RLS on all tables
    - Update policies for better access control
*/

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can view public prayer requests" ON prayer_requests;
  DROP POLICY IF EXISTS "Users can create prayer requests" ON prayer_requests;
  DROP POLICY IF EXISTS "Users can update their own prayer requests" ON prayer_requests;
  DROP POLICY IF EXISTS "Users can delete their own prayer requests" ON prayer_requests;
  DROP POLICY IF EXISTS "Users can view all testimonies" ON testimonies;
  DROP POLICY IF EXISTS "Users can create testimonies" ON testimonies;
  DROP POLICY IF EXISTS "Users can update their own testimonies" ON testimonies;
  DROP POLICY IF EXISTS "Users can delete their own testimonies" ON testimonies;
END $$;

-- Create or update tables
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view public prayer requests"
  ON prayer_requests
  FOR SELECT
  USING (NOT is_private OR user_id = auth.uid());

CREATE POLICY "Users can create prayer requests"
  ON prayer_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own prayer requests"
  ON prayer_requests
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own prayer requests"
  ON prayer_requests
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view all testimonies"
  ON testimonies
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create testimonies"
  ON testimonies
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own testimonies"
  ON testimonies
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own testimonies"
  ON testimonies
  FOR DELETE
  USING (user_id = auth.uid());