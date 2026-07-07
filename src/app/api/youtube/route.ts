import { NextRequest, NextResponse } from "next/server";

function videoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")?.trim();
  const id = url ? videoId(url) : null;

  if (!url || !id) {
    return NextResponse.json(
      { error: "A valid YouTube URL is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${id}`
      )}&format=json`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch this YouTube link" },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      video_title: (data.title as string) || "",
      author: (data.author_name as string) || "",
      thumbnail_url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach YouTube" },
      { status: 502 }
    );
  }
}
