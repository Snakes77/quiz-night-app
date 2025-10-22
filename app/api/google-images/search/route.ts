import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.warn("Google Custom Search API not configured - picture rounds disabled");
      return NextResponse.json(
        { error: "Google Custom Search API not configured" },
        { status: 503 }
      );
    }

    // Use Google Custom Search API for images
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchTerm)}&searchType=image&num=5&imgSize=large&safe=active`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Custom Search API error:", errorData);
      throw new Error("Image search failed");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({
        images: [],
        message: "No images found for this search term"
      });
    }

    const images = data.items.map((item: any) => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title,
      source: item.displayLink,
    }));

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Google Images API error:", error);
    return NextResponse.json(
      { error: "Failed to search images", details: error.message },
      { status: 500 }
    );
  }
}
