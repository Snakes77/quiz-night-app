import { NextResponse } from "next/server";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 min before expiry

  return accessToken;
}

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    const token = await getAccessToken();

    // Search for up to 10 tracks to find one with a preview
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Spotify search failed");
    }

    const data = await response.json();

    // Find first track with a preview URL
    const trackWithPreview = data.tracks?.items?.find((t: any) => t.preview_url);

    if (!trackWithPreview) {
      // No tracks found with preview - return gracefully
      console.log(`No Spotify preview found for: ${searchTerm}`);
      return NextResponse.json({
        previewUrl: null,
        trackName: searchTerm,
        artist: "No preview available",
        error: "No preview available"
      });
    }

    return NextResponse.json({
      previewUrl: trackWithPreview.preview_url,
      trackName: trackWithPreview.name,
      artist: trackWithPreview.artists[0].name,
    });
  } catch (error: any) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Failed to search Spotify", details: error.message },
      { status: 500 }
    );
  }
}
