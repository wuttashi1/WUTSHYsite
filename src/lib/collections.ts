import type { Work } from "@/types";

export const COLLECTION_PREFIX = "artist_collection:";
export interface ArtistCollection {
  version: 1;
  slug: string;
  artist: string;
  title: string;
  message: string;
  work_ids: string[];
  tags: string[];
  tag_mode: "any" | "all";
  published: boolean;
  updated_at: string;
}

export function normalizeSlug(value: string) { return value.trim().toLowerCase(); }
export function validSlug(value: string) { return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(value); }
export function collectionPath(slug: string) { return `/beats/send/${encodeURIComponent(normalizeSlug(slug))}`; }
export function normalizeTags(tags: string[]) { return [...new Set(tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))]; }

/** Manual picks retain their order. Tag matches follow catalogue order, without duplicates. */
export function selectCollectionWorks(collection: Pick<ArtistCollection, "work_ids" | "tags" | "tag_mode">, works: Work[]): Work[] {
  const byId = new Map(works.map(work => [work.id, work]));
  const selected = new Map<string, Work>();
  for (const id of collection.work_ids) { const work = byId.get(id); if (work) selected.set(id, work); }
  const tags = normalizeTags(collection.tags);
  if (tags.length) for (const work of works) {
    const workTags = new Set(normalizeTags(work.tags || []));
    const matches = collection.tag_mode === "all" ? tags.every(tag => workTags.has(tag)) : tags.some(tag => workTags.has(tag));
    if (matches && !selected.has(work.id)) selected.set(work.id, work);
  }
  return [...selected.values()];
}

export function parseCollection(value: unknown): ArtistCollection | null {
  if (!value || typeof value !== "object") return null;
  const c = value as Record<string, unknown>;
  if (c.version !== 1 || typeof c.slug !== "string" || !validSlug(c.slug) ||
      typeof c.artist !== "string" || !c.artist.trim() || c.artist.length > 80 ||
      typeof c.title !== "string" || !c.title.trim() || c.title.length > 120 ||
      typeof c.message !== "string" || c.message.length > 2000 ||
      !Array.isArray(c.work_ids) || c.work_ids.length > 200 || !c.work_ids.every(id => typeof id === "string" && id.length <= 100) ||
      !Array.isArray(c.tags) || c.tags.length > 30 || !c.tags.every(tag => typeof tag === "string" && tag.length <= 80) ||
      !["any", "all"].includes(String(c.tag_mode)) || typeof c.published !== "boolean" || typeof c.updated_at !== "string") return null;
  return { version: 1, slug: c.slug, artist: c.artist.trim(), title: c.title.trim(), message: c.message, work_ids: [...new Set(c.work_ids as string[])], tags: normalizeTags(c.tags as string[]), tag_mode: c.tag_mode as "any" | "all", published: c.published, updated_at: c.updated_at };
}

export const DEMO_COLLECTION: ArtistCollection = {
  version: 1, slug: "fimiquerro", artist: "Fimiquerro", title: "Selected for you", message: "A personal selection of beats and ideas for your next session.", work_ids: ["1"], tags: ["melodic"], tag_mode: "any", published: true, updated_at: "2026-10-02T00:00:00.000Z",
};
