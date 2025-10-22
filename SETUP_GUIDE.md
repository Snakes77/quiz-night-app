# Quick Setup Guide - Get Your APIs and Run the App

Follow these steps IN ORDER to get your Quiz Night App running.

---

## Step 1: Set Up Supabase (5 minutes)

### Create Account & Project
1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New Project"
5. Fill in:
   - Name: `quiz-night-app`
   - Database Password: (create a strong password and SAVE IT)
   - Region: Choose closest to you
6. Click "Create new project" (takes ~2 minutes to provision)

### Get Your API Keys
1. Once project is ready, go to **Settings** (gear icon on left sidebar)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** - Copy this
   - **anon/public key** - Copy this (under "Project API keys")

### Set Up Database
1. Click **SQL Editor** (icon on left sidebar)
2. Click "New query"
3. Open the file `/Users/paulmeakin/quiz-night-app/schema.sql` on your computer
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **RUN** (or press Cmd+Enter)
7. You should see "Success. No rows returned"

✅ **Supabase is done!**

---

## Step 2: Get Google Gemini API Key (2 minutes)

1. Go to **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select "Create API key in new project" (or select existing project)
5. Copy the API key that appears

✅ **Gemini is done!**

---

## Step 3: Get Spotify API Keys (3 minutes)

1. Go to **https://developer.spotify.com/dashboard**
2. Log in with your Spotify account (create free account if needed)
3. Click **"Create app"**
4. Fill in:
   - App name: `Quiz Night App`
   - App description: `Quiz app for music rounds`
   - Redirect URI: `http://localhost:3000` (just for the form)
   - Check "Web API"
5. Click **Save**
6. You'll see your app dashboard
7. Click **Settings**
8. Copy:
   - **Client ID**
   - **Client Secret** (click "View client secret")

✅ **Spotify is done!**

---

## Step 4: Get YouTube API Key (5 minutes)

1. Go to **https://console.cloud.google.com**
2. Sign in with your Google account
3. Click the project dropdown at the top (or "Select a project")
4. Click **"New Project"**
   - Name: `quiz-night-app`
   - Click "Create"
5. Wait for project creation (~30 seconds)
6. Make sure your new project is selected (check top bar)

### Enable YouTube API
7. Click hamburger menu (≡) → **"APIs & Services"** → **"Library"**
8. Search for `YouTube Data API v3`
9. Click on it
10. Click **"Enable"**

### Create API Key
11. Click hamburger menu (≡) → **"APIs & Services"** → **"Credentials"**
12. Click **"+ CREATE CREDENTIALS"** at the top
13. Select **"API Key"**
14. Copy the API key that appears
15. (Optional but recommended) Click "Restrict Key"
    - Under "API restrictions", select "Restrict key"
    - Check only "YouTube Data API v3"
    - Click "Save"

✅ **YouTube is done!**

---

## Step 5: Configure Your App (1 minute)

1. Open the file: `/Users/paulmeakin/quiz-night-app/.env.local`
2. Replace the placeholder values with your actual API keys:

```env
# Paste your Supabase Project URL here
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co

# Paste your Supabase anon key here
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Paste your Gemini API key here
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Paste your Spotify Client ID here
SPOTIFY_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Paste your Spotify Client Secret here
SPOTIFY_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Paste your YouTube API key here
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Save the file**

✅ **Configuration is done!**

---

## Step 6: Run Your App! (1 minute)

Open Terminal and run:

```bash
cd /Users/paulmeakin/quiz-night-app
npm run dev
```

You should see:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
```

Open your browser to **http://localhost:3000**

---

## Step 7: Test It Out!

1. **Sign up** with an email and password
2. You'll be redirected to the **Dashboard**
3. Click **"+ Create New Quiz"**
4. Fill in:
   - Quiz Name: "Test Quiz"
   - Round 1 Theme: "90s Music"
   - Question Type: "Music"
   - Prompt: "20 questions about 90s Britpop bands with song names"
5. Click **"Generate 20 Questions"**
6. Wait ~10 seconds for AI to generate questions
7. Review the questions (Spotify previews will auto-load)
8. Click **"Save Quiz"**
9. Back on dashboard, click **"Present Mode"**
10. Test the presentation!

---

## 🎉 You're Done!

Your Quiz Night App is now fully functional!

---

## Troubleshooting

### "Failed to generate questions"
- Check your Gemini API key is correct
- Make sure you didn't exceed the free tier limit (60 requests/minute)

### "No preview available for this track"
- Not all songs on Spotify have 30-second previews
- This is a Spotify limitation, not a bug

### "YouTube search failed"
- Check your YouTube API key is correct
- Make sure YouTube Data API v3 is enabled in Google Cloud Console
- Free tier: 10,000 quota units/day (100 searches)

### "Invalid Supabase credentials"
- Double-check you copied the FULL URL and key
- Make sure you're using the anon/public key, not the service key
- Check there are no extra spaces

### Database errors
- Make sure you ran the `schema.sql` file in Supabase SQL Editor
- Check the query ran successfully

---

## What's Next?

- Create your first real quiz!
- Test all three question types (General, Music, Film)
- Run a quiz night!
- Deploy to Vercel for free hosting (see README.md)

---

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Google AI Studio**: https://makersuite.google.com
- **Spotify Dashboard**: https://developer.spotify.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com

---

Need help? Check the full **README.md** for more details!
