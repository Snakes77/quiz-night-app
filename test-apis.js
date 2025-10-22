// Test script for all API keys
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing all API keys...\n');

// Test 1: Supabase
console.log('1️⃣ SUPABASE');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

// Test 2: Gemini
console.log('\n2️⃣ GOOGLE GEMINI');
const geminiKey = process.env.GEMINI_API_KEY;
console.log('Key:', geminiKey ? `✅ Set (${geminiKey.substring(0, 20)}...)` : '❌ Missing');

if (geminiKey) {
  console.log('Testing Gemini API...');
  fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.models) {
        console.log('✅ Gemini API Working!');
        console.log('Available models:', data.models.map(m => m.name).join(', '));
      } else if (data.error) {
        console.log('❌ Gemini Error:', data.error.message);
      }
    })
    .catch(err => console.log('❌ Gemini Error:', err.message));
}

// Test 3: Spotify
console.log('\n3️⃣ SPOTIFY');
const spotifyId = process.env.SPOTIFY_CLIENT_ID;
const spotifySecret = process.env.SPOTIFY_CLIENT_SECRET;
console.log('Client ID:', spotifyId ? '✅ Set' : '❌ Missing');
console.log('Client Secret:', spotifySecret ? '✅ Set' : '❌ Missing');

if (spotifyId && spotifySecret) {
  console.log('Testing Spotify API...');
  const auth = Buffer.from(`${spotifyId}:${spotifySecret}`).toString('base64');
  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        console.log('✅ Spotify API Working!');
      } else {
        console.log('❌ Spotify Error:', data.error_description || data.error);
      }
    })
    .catch(err => console.log('❌ Spotify Error:', err.message));
}

// Test 4: YouTube
console.log('\n4️⃣ YOUTUBE');
const youtubeKey = process.env.YOUTUBE_API_KEY;
console.log('Key:', youtubeKey ? `✅ Set (${youtubeKey.substring(0, 20)}...)` : '❌ Missing');

if (youtubeKey) {
  console.log('Testing YouTube API...');
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${youtubeKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.items) {
        console.log('✅ YouTube API Working!');
      } else if (data.error) {
        console.log('❌ YouTube Error:', data.error.message);
      }
    })
    .catch(err => console.log('❌ YouTube Error:', err.message));
}

setTimeout(() => {
  console.log('\n✅ Test complete!');
}, 3000);
