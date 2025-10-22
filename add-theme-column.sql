-- Add theme column to quizzes table
ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dalyan'
CHECK (theme IN ('dalyan', 'manchester-united'));
