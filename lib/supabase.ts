import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Quiz = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Round = {
  id: string;
  quiz_id: string;
  round_number: number;
  theme: string;
  created_at: string;
};

export type Question = {
  id: string;
  round_id: string;
  question_number: number;
  question_text: string;
  answer_text: string;
  type: 'music' | 'film' | 'general' | 'history' | 'geography' | 'science' | 'sports' | 'food' | 'decades' | 'picture';
  spotify_preview_url?: string;
  youtube_video_id?: string;
  youtube_start_seconds?: number;
  youtube_end_seconds?: number;
  image_url?: string;
  created_at: string;
};
