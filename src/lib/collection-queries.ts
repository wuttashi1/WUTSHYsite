import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_WORKS } from "@/lib/data";
import { COLLECTION_PREFIX, DEMO_COLLECTION, normalizeSlug, validSlug, parseCollection, selectCollectionWorks } from "@/lib/collections";
import type { Work } from "@/types";

export async function getArtistCollection(rawSlug: string) {
  const slug = normalizeSlug(rawSlug);
  if (!validSlug(slug)) return null;
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production" || slug !== DEMO_COLLECTION.slug) return null;
    return { collection: DEMO_COLLECTION, works: selectCollectionWorks(DEMO_COLLECTION, DEMO_WORKS), demo: true };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("wutshy_settings").select("value").eq("key", COLLECTION_PREFIX + slug).maybeSingle();
  if (error) throw new Error("Could not load artist collection");
  const collection = parseCollection(data?.value);
  if (!collection || collection.slug !== slug || !collection.published) return null;
  const { data: works, error: worksError } = await supabase.from("works").select("*").order("sort_order").order("id");
  if (worksError) throw new Error("Could not load collection works");
  return { collection, works: selectCollectionWorks(collection, (works || []) as Work[]), demo: false };
}
