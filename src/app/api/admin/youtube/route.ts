import { NextResponse } from "next/server";
import { isSiteAdmin, sameOrigin } from "@/lib/visualizer/server";
import { connectYoutube, integration, refreshYoutube } from "@/lib/youtube-server";
export const runtime = "nodejs";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  if (!await isSiteAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  try {
    const row = await integration();
    return NextResponse.json({ configured: !!row, channel: row?.catalog?.channel, count: row?.catalog?.videos?.length || 0, syncedAt: row?.synced_at, error: row?.last_error }, { headers });
  } catch { return NextResponse.json({ error: "YouTube settings unavailable" }, { status: 503, headers }); }
}
export async function PUT(req: Request) {
  if (!sameOrigin(req) || !await isSiteAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  try {
    const raw = await req.text();
    if (raw.length > 512) return NextResponse.json({ error: "Invalid API key" }, { status: 400, headers });
    const key = JSON.parse(raw).key;
    if (typeof key !== "string" || !/^[A-Za-z0-9_-]{20,200}$/.test(key.trim())) return NextResponse.json({ error: "Invalid API key" }, { status: 400, headers });
    const catalog = await connectYoutube(key.trim());
    return NextResponse.json({ ok: true, count: catalog.videos.length }, { headers });
  } catch (error) {
    const message = error instanceof Error && error.message === "YouTube quota exceeded" ? error.message : "YouTube key verification failed";
    return NextResponse.json({ error: message }, { status: 400, headers });
  }
}
export async function POST(req: Request) {
  if (!sameOrigin(req) || !await isSiteAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  try { const result = await refreshYoutube(true); return NextResponse.json({ ok: !result.stale && result.configured, count: result.videos.length }, { headers }); }
  catch { return NextResponse.json({ error: "YouTube refresh failed" }, { status: 503, headers }); }
}
