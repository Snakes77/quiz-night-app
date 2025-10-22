# Quiz Night Web App

A web application for creating and running pub-style quizzes with 4 rounds of 20 questions each, including music and film rounds with embedded media.

## Features

- User authentication with Supabase
- AI-powered question generation using Google Gemini
- Music rounds with 30-second Spotify previews
- Film rounds with YouTube video clips
- Full-screen presentation mode
- Save and manage multiple quizzes
- Clean, responsive UI

## Tech Stack

- Next.js 14+ (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase (database + authentication)
- Google Gemini API
- Spotify Web API
- YouTube Data API v3

## Prerequisites

Before you begin, you'll need to obtain API keys from the following services:

1. **Supabase Account** (free tier available)
2. **Google Gemini API Key** (free tier available)
3. **Spotify Developer Account** (free)
4. **YouTube Data API Key** (free, requires Google Cloud account)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd quiz-night-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Go to Project Settings > API
4. Copy your project URL and anon/public key
5. Go to SQL Editor and run the contents of `schema.sql` to create the database tables

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 4. Set Up Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app name and description (any values work)
5. Accept the terms and create the app
6. Copy your Client ID and Client Secret

### 5. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
   - (Optional but recommended) Restrict the key to YouTube Data API v3

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual API keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Quiz

1. Sign up or log in
2. Click "Create New Quiz" from the dashboard
3. Enter a quiz name
4. For each of the 4 rounds:
   - Enter a round theme
   - Select question type (General, Music, or Film)
   - Write a prompt describing what you want
   - Click "Generate 20 Questions"
   - Review and edit questions
   - For film questions, select YouTube videos and set timestamps
5. Click "Save Quiz"

### Running a Quiz

1. From the dashboard, click on a quiz
2. Click "Start Presentation"
3. Use the "Show Answer" button to reveal answers
4. Use "Previous" and "Next" buttons to navigate
5. For music questions, click "Play Music Clip" to play the 30-second preview
6. For film questions, click "Play Clip" to play the selected video segment
7. Use "Fullscreen" for a better presentation experience

## Deployment to Vercel

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add all environment variables from `.env.local` to Vercel:
   - Go to Settings > Environment Variables
   - Add each variable
6. Deploy!

Your app will be live at `https://your-app-name.vercel.app`

## Project Structure

```
quiz-night-app/
├── app/
│   ├── api/                      # API routes
│   │   ├── gemini/generate/      # AI question generation
│   │   ├── spotify/search/       # Spotify track search
│   │   └── youtube/search/       # YouTube video search
│   ├── dashboard/                # User dashboard
│   ├── quiz/
│   │   ├── new/                  # Quiz builder
│   │   ├── [id]/                 # View/edit quiz
│   │   └── [id]/present/         # Presentation mode
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing/auth page
│   └── globals.css               # Global styles
├── components/
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── supabase.ts               # Supabase client & types
│   └── utils.ts                  # Utility functions
├── schema.sql                    # Database schema
└── README.md                     # This file
```

## Database Schema

The app uses three main tables:

- **quizzes**: Stores quiz metadata
- **rounds**: Stores round information (4 per quiz)
- **questions**: Stores questions (20 per round)

All tables have Row Level Security (RLS) enabled so users can only access their own data.

## API Rate Limits

Be aware of the following free tier limits:

- **Gemini API**: 60 requests per minute
- **Spotify API**: No strict limit on Client Credentials flow
- **YouTube API**: 10,000 quota units per day (1 search = 100 units)

## Troubleshooting

### Questions not generating
- Check your Gemini API key is correct
- Check browser console for errors
- Ensure you filled in both theme and prompt

### Spotify previews not working
- Not all songs have 30-second previews available
- Check your Spotify Client ID and Secret are correct

### YouTube videos not found
- Try more specific search terms
- Some videos may be region-restricted

### Database errors
- Ensure you ran the `schema.sql` file in Supabase
- Check your Supabase URL and anon key are correct

## License

MIT

## Support

For issues and questions, please open an issue on the GitHub repository.
