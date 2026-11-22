export const BEATS_CHANNEL_ID = "UCcr6zSvEL26HgESSGnkUhrw";
export const BEATS_CHANNEL_URL = `https://www.youtube.com/channel/${BEATS_CHANNEL_ID}`;
export interface YoutubeBeat { id: string; title: string; published: string; }
export interface YoutubeCatalog { channel: string; videos: YoutubeBeat[]; }
type YoutubeResponse = { items?: Array<{ snippet?: { title?: string; resourceId?: { videoId?: string }; publishedAt?: string }; contentDetails?: { relatedPlaylists?: { uploads?: string }; videoPublishedAt?: string }; status?: { privacyStatus?: string } }>; nextPageToken?: string };

export async function fetchYoutubeCatalog(request: (resource: string, params: Record<string, string>) => Promise<YoutubeResponse>): Promise<YoutubeCatalog> {
  const channel = (await request("channels", { id: BEATS_CHANNEL_ID, part: "snippet,contentDetails" })).items?.[0];
  const playlistId = channel?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) throw new Error("Channel unavailable");
  const videos = new Map<string, YoutubeBeat>();
  const seen = new Set<string>();
  let pageToken = "";
  do {
    if (seen.has(pageToken)) throw new Error("Repeated YouTube page");
    seen.add(pageToken);
    const page = await request("playlistItems", { playlistId, part: "snippet,contentDetails,status", maxResults: "50", ...(pageToken ? { pageToken } : {}) });
    for (const item of page.items || []) {
      const id = item.snippet?.resourceId?.videoId;
      if (id && /^[\w-]{11}$/.test(id) && item.status?.privacyStatus === "public") videos.set(id, { id, title: item.snippet?.title || "YouTube beat", published: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || "" });
    }
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return { channel: channel?.snippet?.title || "WUTSHY BEATS II", videos: [...videos.values()] };
}
