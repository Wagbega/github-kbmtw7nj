-- Create stream chat table
CREATE TABLE IF NOT EXISTS stream_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_stream_chat_stream_id ON stream_chat(stream_id);
CREATE INDEX idx_stream_chat_user_id ON stream_chat(user_id);
CREATE INDEX idx_stream_chat_created_at ON stream_chat(created_at);

-- Create policies
CREATE POLICY "Anyone can view chat messages"
  ON stream_chat
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert chat messages"
  ON stream_chat
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON stream_chat
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON stream_chat
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);