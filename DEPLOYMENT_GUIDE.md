# 🚀 Deployment Guide - Dalyan Quiz Night App

## Deploy to Vercel (Recommended - FREE)

Your app will be live at: `https://your-quiz-app.vercel.app`

---

## STEP 1: Prepare Your Code

### 1.1 Initialize Git Repository

```bash
cd /Users/paulmeakin/quiz-night-app
git init
git add .
git commit -m "Initial commit - Dalyan Quiz Night App"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `dalyan-quiz-night`
3. Description: "AI-powered quiz night app with Turkish theme"
4. Make it **Private** (to protect your code)
5. Click "Create repository"

### 1.3 Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/dalyan-quiz-night.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Deploy to Vercel

### 2.1 Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Sign up with **GitHub** (easiest option)
3. Authorize Vercel to access your repositories

### 2.2 Import Your Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Find `dalyan-quiz-night` in the list
4. Click **"Import"**

### 2.3 Configure Project

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)

### 2.4 Add Environment Variables

⚠️ **CRITICAL STEP** - Click "Environment Variables" and add these:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY = AIzaSy...
SPOTIFY_CLIENT_ID = your_spotify_client_id
SPOTIFY_CLIENT_SECRET = your_spotify_client_secret
YOUTUBE_API_KEY = AIzaSy...
GOOGLE_SEARCH_API_KEY = AIzaSy...
GOOGLE_SEARCH_ENGINE_ID = your_search_engine_id
```

**How to get these values:**
- Open `/Users/paulmeakin/quiz-night-app/.env.local`
- Copy each variable name and value
- Paste into Vercel's environment variables form

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. 🎉 Your app is LIVE!

---

## STEP 3: Update Supabase Settings

### 3.1 Add Vercel URL to Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**: `https://your-quiz-app.vercel.app`
4. Add to **Redirect URLs**: `https://your-quiz-app.vercel.app/**`

---

## 🎯 YOUR LIVE APP

After deployment, your app will be available at:

```
https://your-quiz-app.vercel.app
```

Example names Vercel might suggest:
- `dalyan-quiz-night.vercel.app`
- `quiz-night-app-paul.vercel.app`
- `paul-quiz-app.vercel.app`

### Custom Domain (Optional)

Want your own domain like `dalyanquiz.com`?

1. Buy domain from Namecheap/GoDaddy (~$10-15/year)
2. In Vercel: Settings → Domains → Add Domain
3. Follow DNS instructions
4. Your app will be at `https://dalyanquiz.com`

---

## 🔄 AUTOMATIC DEPLOYMENTS

After initial deployment, every time you:

```bash
git add .
git commit -m "Add new feature"
git push
```

Vercel will **automatically**:
1. Build your app
2. Run tests
3. Deploy to production
4. Update your live site

---

## 🔧 POST-DEPLOYMENT TASKS

### Update Database (If Needed)

If you already have a Supabase database from local development:

1. Go to Supabase SQL Editor
2. Run `DATABASE_UPDATE.sql` to add new fields
3. This updates: image_url, new question types, round limits

---

## 📊 MONITORING YOUR APP

### Vercel Dashboard

View at: https://vercel.com/dashboard

- **Analytics**: Page views, visitors
- **Logs**: Error tracking
- **Performance**: Speed metrics
- **Deployments**: All versions

### Supabase Dashboard

View at: https://supabase.com/dashboard

- **Database**: View all quizzes
- **Auth**: See registered users
- **Logs**: API usage

---

## 💰 COSTS

### FREE TIER INCLUDES:
- ✅ Unlimited websites
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL (HTTPS)
- ✅ Global CDN
- ✅ Unlimited team members

### API Rate Limits (Free Tier):
- **Supabase**: 500 MB database, 2 GB bandwidth/month
- **Gemini**: 60 requests/minute
- **YouTube**: 10,000 quota units/day (~100 searches)
- **Google Search**: 100 searches/day
- **Spotify**: No strict limits

💡 **Tip**: For quiz nights with ~50 people, free tier is MORE than enough!

---

## 🆘 TROUBLESHOOTING

### Build Fails

**Error**: "Module not found"
```bash
# Locally run:
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Make sure ALL variables are added
3. Click "Redeploy" to apply changes

### Database Connection Error

1. Check Supabase URL is correct
2. Verify anon key (not service key!)
3. Check if you added Vercel URL to Supabase auth settings

### YouTube/Spotify Not Working

1. Verify API keys in Vercel environment variables
2. Check API quotas haven't been exceeded
3. Test APIs directly in browser console

---

## 🎉 ALTERNATIVE HOSTING OPTIONS

### Netlify (Also Free)
- Similar to Vercel
- Deploy: https://netlify.com
- Same process as Vercel

### Railway (Free Tier)
- Good for full-stack apps
- Deploy: https://railway.app
- $5/month after free credits

### Your Own Server (Advanced)
- DigitalOcean/AWS/Google Cloud
- Requires more setup
- ~$5-10/month

---

## 📱 SHARE YOUR QUIZ APP

Once deployed, share with friends:

```
Hey! Check out my quiz night app:
https://your-quiz-app.vercel.app

🇹🇷 Dalyan Quiz Night 🇹🇷
- AI-powered questions
- Music & film rounds
- Beautiful Turkish theme
```

---

## 🔐 SECURITY CHECKLIST

✅ Environment variables in Vercel (not in code)
✅ `.env.local` in `.gitignore`
✅ Supabase Row Level Security enabled
✅ HTTPS enabled (automatic with Vercel)
✅ Private GitHub repository (optional)

---

## 📚 HELPFUL LINKS

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs
- **Your Vercel Dashboard**: https://vercel.com/dashboard
- **Your Supabase Dashboard**: https://supabase.com/dashboard

---

## 🎯 QUICK START COMMANDS

```bash
# 1. Commit your code
git add .
git commit -m "Ready for deployment"
git push

# 2. That's it! Vercel auto-deploys
```

---

**Need help?** Check Vercel logs or Supabase logs for detailed error messages.

**Pro Tip**: Deploy first, then test thoroughly before your quiz night!

---

**Your app is production-ready!** 🚀🇹🇷

