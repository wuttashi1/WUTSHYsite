import type { SiteSettings } from "@/types";

export interface HomeVideo {
  id: string;
  url: string;
  title: string;
  format: "auto" | "16:9" | "9:16";
}

export function parseYoutube(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : /^\/(?:shorts|embed|live)\/([^/]+)\/?$/.exec(url.pathname)?.[1] || null;
    }
    return id && /^[\w-]{11}$/.test(id) ? { id, portrait: url.pathname.startsWith("/shorts/") } : null;
  } catch { return null; }
}

export function homeVideos(settings: SiteSettings["featured_video"]): HomeVideo[] {
  // An explicit empty list means the administrator removed every video.
  if (Array.isArray(settings.videos)) return settings.videos.filter(v => v && typeof v.url === "string" && parseYoutube(v.url));
  return parseYoutube(settings.youtube_url) ? [{ id: "legacy", url: settings.youtube_url, title: settings.video_title, format: "auto" }] : [];
}

export function carouselOffset(index: number, active: number, count: number) {
  return ((index - active + Math.floor(count / 2) + count) % count) - Math.floor(count / 2);
}
