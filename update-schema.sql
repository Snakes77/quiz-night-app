-- Update schema to allow flexible number of rounds (1-10)
-- Run this in your Supabase SQL Editor

ALTER TABLE rounds DROP CONSTRAINT IF EXISTS rounds_round_number_check;
ALTER TABLE rounds ADD CONSTRAINT rounds_round_number_check CHECK (round_number >= 1 AND round_number <= 10);
