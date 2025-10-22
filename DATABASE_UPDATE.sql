-- DATABASE UPDATE SCRIPT
-- Run this in your Supabase SQL Editor to update existing database
-- Only needed if you already created tables - new installations should use schema.sql

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE questions ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Update question type constraint to include new types
ALTER TABLE questions 
  DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE questions 
  ADD CONSTRAINT questions_type_check 
  CHECK (type IN ('music', 'film', 'general', 'history', 'geography', 'science', 'sports', 'food', 'decades', 'picture'));

-- Update max question number (from 20 to 50)
ALTER TABLE questions 
  DROP CONSTRAINT IF EXISTS questions_question_number_check;

ALTER TABLE questions 
  ADD CONSTRAINT questions_question_number_check 
  CHECK (question_number >= 1 AND question_number <= 50);

-- Update max rounds (from 4 to 6)
ALTER TABLE rounds 
  DROP CONSTRAINT IF EXISTS rounds_round_number_check;

ALTER TABLE rounds 
  ADD CONSTRAINT rounds_round_number_check 
  CHECK (round_number >= 1 AND round_number <= 6);

-- Verify updates
SELECT 
  'Questions table updated successfully' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'questions' 
  AND column_name IN ('image_url', 'type')
ORDER BY column_name;

