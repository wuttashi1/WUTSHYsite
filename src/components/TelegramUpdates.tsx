import { unstable_cache } from "next/cache";
import { privateDb } from "@/lib/contact-server";
import { TelegramPost } from "./TelegramPost";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const channel = "https://t.me/wutshy";
const initialPosts = [326, 325, 322];

// Some channels expose individual embeds but redirect their public timeline.
const discoverPosts = unstable_cache(async (after: number) => {
  const candidates = Array.from({ length: 8 }, (_, index) => after + index + 1);
  const checks = await Promise.all(candidates.map(async id => {
    try {
      const response = await fetch(`${channel}/${id}?embed=1`, {
        cache: "no-store", signal: AbortSignal.timeout(3500),
      });
      return response.ok && (await response.text()).includes(`data-post="wutshy/${id}"`) ? id : null;
    } catch {
      return null;
    }
  }));
  const ids = checks.filter((id): id is number => id !== null);
  if (ids.length) {
    try {
      const rows = ids.map(id => ({ key: "wutshy-channel-" + String(id).padStart(12, "0"), value: id }));
      const { error } = await privateDb().from("wutshy_settings").upsert(rows);
      if (error) console.warn("Telegram post cache could not be updated");
    } catch {
      console.warn("Telegram post cache unavailable");
    }
  }
  return ids;
}, ["wutshy-public-embeds"], { revalidate: 180 });

async function latestPosts() {
  const preview = fetch("https://t.me/s/wutshy", {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(3500),
  }).then(async response => {
    if (!response.ok) return [];
    return Array.from((await response.text()).matchAll(/data-post="wutshy\/(\d+)"/gi), match => Number(match[1]));
  }).catch(() => []);
  const recorded = async () => {
    if (!isSupabaseConfigured()) return [];
    const db = await createClient();
    const { data } = await db.from("wutshy_settings").select("value")
      .like("key", "wutshy-channel-%").order("key", { ascending: false }).limit(3);
    return (data ?? []).map(row => row.value).filter(Number.isSafeInteger) as number[];
  };
  const [publicIds, botIds] = await Promise.all([preview, recorded().catch(() => [])]);
  const known = [...publicIds, ...botIds, ...initialPosts];
  const discovered = publicIds.length ? [] : await discoverPosts(Math.max(...known));
  return [...new Set([...known, ...discovered])].sort((a, b) => b - a).slice(0, 3);
}

export async function TelegramUpdates() {
  const posts = await latestPosts();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">Telegram</h2>
        <a className="underline underline-offset-4" href={channel} target="_blank" rel="noreferrer">@wutshy ↗</a>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map(id => (
          <article key={id} className="min-w-0 rounded-2xl border border-black/10 p-3">
            <TelegramPost id={id} />
            <a href={`${channel}/${id}`} target="_blank" rel="noreferrer" className="text-sm underline">@wutshy / {id} ↗</a>
          </article>
        ))}
      </div>
    </section>
  );
}
