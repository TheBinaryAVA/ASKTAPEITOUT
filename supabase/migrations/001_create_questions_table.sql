-- Create the questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  question JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
DROP POLICY IF EXISTS "Users can insert their own questions" ON public.questions;
DROP POLICY IF EXISTS "Users can update their own questions" ON public.questions;
DROP POLICY IF EXISTS "Users can delete their own questions" ON public.questions;

-- Policy: Anyone can view all questions (SELECT)
CREATE POLICY "Anyone can view questions"
ON public.questions FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own questions
CREATE POLICY "Users can insert their own questions"
ON public.questions FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  auth.uid() IS NOT NULL
);

-- Policy: Users can update only their own questions
CREATE POLICY "Users can update their own questions"
ON public.questions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own questions
CREATE POLICY "Users can delete their own questions"
ON public.questions FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.questions TO authenticated;
GRANT SELECT ON public.questions TO anon;
