-- Quiz Night App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 6),
  theme TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, round_number)
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 50),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('music', 'film', 'general', 'history', 'geography', 'science', 'sports', 'food', 'decades', 'picture')),
  spotify_preview_url TEXT,
  youtube_video_id TEXT,
  youtube_start_seconds INTEGER,
  youtube_end_seconds INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, question_number)
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Users can view their own quizzes"
  ON quizzes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = user_id);

-- Rounds policies
CREATE POLICY "Users can view rounds of their quizzes"
  ON rounds FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = rounds.quiz_id
    AND quizzes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create rounds in their quizzes"
  ON rounds FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = rounds.quiz_id
    AND quizzes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update rounds in their quizzes"
  ON rounds FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = rounds.quiz_id
    AND quizzes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete rounds in their quizzes"
  ON rounds FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = rounds.quiz_id
    AND quizzes.user_id = auth.uid()
  ));

-- Questions policies
CREATE POLICY "Users can view questions in their rounds"
  ON questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rounds
    JOIN quizzes ON quizzes.id = rounds.quiz_id
    WHERE rounds.id = questions.round_id
    AND quizzes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create questions in their rounds"
  ON questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM rounds
    JOIN quizzes ON quizzes.id = rounds.quiz_id
    WHERE rounds.id = questions.round_id
    AND quizzes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update questions in their rounds"
  ON questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM rounds
    JOIN quizzes ON quizzes.id = rounds.quiz_id
    WHERE rounds.id = questions.round_id
    AND quizzes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete questions in their rounds"
  ON questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM rounds
    JOIN quizzes ON quizzes.id = rounds.quiz_id
    WHERE rounds.id = questions.round_id
    AND quizzes.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_rounds_quiz_id ON rounds(quiz_id);
CREATE INDEX idx_questions_round_id ON questions(round_id);
