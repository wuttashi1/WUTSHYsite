import { Work, DrumKit } from "@/types";
import { DEMO_WORKS, DEMO_DRUM_KITS } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export { getSiteSettings } from "@/lib/settings";

export async function getWorks(type?: string): Promise<Work[]> {
  if (!isSupabaseConfigured()) {
    return type ? DEMO_WORKS.filter((w) => w.type === type) : DEMO_WORKS;
  }

  const supabase = await createClient();
  let query = supabase
    .from("works")
    .select("*")
    .order("sort_order", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error || !data) {
    return type ? DEMO_WORKS.filter((w) => w.type === type) : DEMO_WORKS;
  }
  return data as Work[];
}

export async function getWork(id: string): Promise<Work | null> {
  if (!isSupabaseConfigured()) {
    return DEMO_WORKS.find((w) => w.id === id) || null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("works").select("*").eq("id", id).single();
  return (data as Work) || null;
}

export async function getFeaturedWorks(): Promise<Work[]> {
  const works = await getWorks();
  return works.filter((w) => w.is_featured);
}

export async function getDrumKits(): Promise<DrumKit[]> {
  if (!isSupabaseConfigured()) return DEMO_DRUM_KITS;

  const supabase = await createClient();
  const { data: kits, error } = await supabase
    .from("drum_kits")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !kits) return DEMO_DRUM_KITS;

  const { data: tracks } = await supabase
    .from("drum_kit_tracks")
    .select("*")
    .order("sort_order", { ascending: true });

  return kits.map((kit) => ({
    ...kit,
    tracks: (tracks || []).filter((t) => t.drum_kit_id === kit.id),
  })) as DrumKit[];
}

export async function getDrumKit(id: string): Promise<DrumKit | null> {
  const kits = await getDrumKits();
  return kits.find((k) => k.id === id) || null;
}

export interface SearchResults {
  works: Work[];
  kits: DrumKit[];
}

export async function searchContent(rawQuery: string): Promise<SearchResults> {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return { works: [], kits: [] };

  const [works, kits] = await Promise.all([getWorks(), getDrumKits()]);

  const matchesWork = (w: Work) =>
    w.title.toLowerCase().includes(q) ||
    (w.artist?.toLowerCase().includes(q) ?? false) ||
    (w.description?.toLowerCase().includes(q) ?? false) ||
    (w.musical_key?.toLowerCase().includes(q) ?? false) ||
    w.tags.some((t) => t.toLowerCase().includes(q));

  const matchesKit = (k: DrumKit) =>
    k.title.toLowerCase().includes(q) ||
    (k.description?.toLowerCase().includes(q) ?? false) ||
    k.tags.some((t) => t.toLowerCase().includes(q));

  return {
    works: works.filter(matchesWork),
    kits: kits.filter(matchesKit),
  };
}
