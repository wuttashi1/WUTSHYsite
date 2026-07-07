import { NextRequest, NextResponse } from "next/server";

type SpotifyType = "track" | "playlist" | "album" | "episode" | "show" | "";

function detectType(url: string): SpotifyType {
  const m = url.match(
    /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|episode|show)\//i
  );
  return (m?.[1]?.toLowerCase() as SpotifyType) || "";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")?.trim();

  if (!url || !/open\.spotify\.com\//i.test(url)) {
    return NextResponse.json(
      { error: "A valid Spotify URL is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch this Spotify link" },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      title: (data.title as string) || "",
      thumbnail_url: (data.thumbnail_url as string) || "",
      type: detectType(url),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Spotify" },
      { status: 502 }
    );
  }
}
