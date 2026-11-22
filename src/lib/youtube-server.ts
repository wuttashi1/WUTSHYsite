import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { privateDb } from "@/lib/contact-server";
import { fetchYoutubeCatalog, type YoutubeCatalog } from "./youtube-catalog";

const empty: YoutubeCatalog = { channel: "WUTSHY BEATS II", videos: [] };
function cipherKey() {
  const secret = process.env.CONTACT_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Server unavailable");
  return createHash("sha256").update(`youtube:${secret}`).digest();
}
function encrypt(key: string) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", cipherKey(), iv);
  return { iv: iv.toString("base64"), data: Buffer.concat([cipher.update(key, "utf8"), cipher.final()]).toString("base64"), tag: cipher.getAuthTag().toString("base64") };
}
function decrypt(value: { iv: string; data: string; tag: string }) {
  const decipher = createDecipheriv("aes-256-gcm", cipherKey(), Buffer.from(value.iv, "base64"));
  decipher.setAuthTag(Buffer.from(value.tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(value.data, "base64")), decipher.final()]).toString("utf8");
}
export async function integration() {
  const { data, error } = await privateDb().from("youtube_integration").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error("YouTube settings unavailable");
  return data;
}
async function download(key: string) {
  const deadline = AbortSignal.timeout(45000);
  return fetchYoutubeCatalog(async (resource, params) => {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${resource}?${new URLSearchParams(params)}`, { headers: { "X-Goog-Api-Key": key }, cache: "no-store", signal: deadline });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const reason = body?.error?.errors?.[0]?.reason;
      // Never return Google's raw error: it can contain credential details.
      throw new Error(reason === "quotaExceeded" || reason === "dailyLimitExceeded" ? "YouTube quota exceeded" : "YouTube key verification failed");
    }
    return response.json();
  });
}
export async function connectYoutube(key: string) {
  const catalog = await download(key);
  const now = new Date().toISOString();
  const { error } = await privateDb().from("youtube_integration").upsert({ id: 1, encrypted_key: encrypt(key), catalog, synced_at: now, attempted_at: now, last_error: null });
  if (error) throw new Error("YouTube settings unavailable");
  return catalog;
}
export async function refreshYoutube(force = false) {
  const row = await integration();
  if (!row) return { ...empty, configured: false, stale: false };
  const cached = row.catalog as YoutubeCatalog;
  const age = Date.now() - Date.parse(row.attempted_at);
  if (age < (force ? 60000 : 900000)) return { ...cached, configured: true, stale: !!row.last_error };
  const now = new Date().toISOString();
  // Claim the refresh in Postgres so simultaneous visitors share one sync.
  const { data: claimed, error: claimError } = await privateDb().from("youtube_integration").update({ attempted_at: now }).eq("id", 1).eq("attempted_at", row.attempted_at).select("id");
  if (claimError || !claimed?.length) return { ...cached, configured: true, stale: !!row.last_error };
  try {
    const catalog = await download(decrypt(row.encrypted_key));
    const { error } = await privateDb().from("youtube_integration").update({ catalog, synced_at: now, last_error: null }).eq("id", 1).eq("attempted_at", now);
    if (error) throw new Error("YouTube settings unavailable");
    return { ...catalog, configured: true, stale: false };
  } catch (error) {
    const message = error instanceof Error && error.message === "YouTube quota exceeded" ? error.message : "YouTube refresh failed";
    await privateDb().from("youtube_integration").update({ last_error: message }).eq("id", 1).eq("attempted_at", now);
    return { ...cached, configured: true, stale: true };
  }
}
