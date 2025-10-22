-- Update schema to support Picture Rounds
-- Run this in your Supabase SQL Editor

-- Add image_url column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the type check constraint to include 'picture'
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_type_check
  CHECK (type IN ('music', 'film', 'general', 'history', 'geography', 'science', 'sports', 'food', 'decades', 'picture'));
