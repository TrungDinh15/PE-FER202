-- Drop existing table
DROP TABLE IF EXISTS books;

-- Create table books
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 80),
  author TEXT NOT NULL CHECK (char_length(trim(author)) > 0 AND char_length(author) <= 60),
  pages INTEGER NOT NULL CHECK (pages >= 1 AND pages <= 5000),
  status TEXT NOT NULL DEFAULT 'To Read' CHECK (status IN ('To Read', 'Reading', 'Finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own books"
ON books FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books"
ON books FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
ON books FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
ON books FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

