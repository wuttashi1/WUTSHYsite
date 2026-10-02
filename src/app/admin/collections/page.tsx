"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, ExternalLink, ListMusic, Pencil, Plus, Trash2 } from "lucide-react";
import { T, useLocale } from "@/components/LocaleProvider";
import { Button, Field, TextInput, TextArea, Select, Toggle, useConfirm, useToast } from "@/components/admin/ui";
import { ArtistSelection } from "@/components/ArtistSelection";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_WORKS } from "@/lib/data";
import { COLLECTION_PREFIX, DEMO_COLLECTION, collectionPath, normalizeSlug, normalizeTags, parseCollection, selectCollectionWorks, validSlug, type ArtistCollection } from "@/lib/collections";
import type { Work } from "@/types";

function blank(): ArtistCollection { return { version: 1, slug: "", artist: "", title: "Selected for you", message: "", work_ids: [], tags: [], tag_mode: "any", published: false, updated_at: "" }; }

export default function CollectionsAdminPage() {
  const { t } = useLocale();
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const [collections, setCollections] = useState<ArtistCollection[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [form, setForm] = useState<ArtistCollection | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const configured = isSupabaseConfigured();

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (!configured) { setCollections([DEMO_COLLECTION]); setWorks(DEMO_WORKS); return; }
      const db = createClient();
      const [rows, catalogue] = await Promise.all([
        db.from("wutshy_settings").select("key,value").like("key", COLLECTION_PREFIX + "%"),
        db.from("works").select("*").order("sort_order").order("id"),
      ]);
      if (rows.error || catalogue.error) throw new Error("Could not load selections");
      setCollections((rows.data || []).flatMap(row => { const c = parseCollection(row.value); return c && row.key === COLLECTION_PREFIX + c.slug ? [c] : []; }).sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
      setWorks((catalogue.data || []) as Work[]);
    } catch { setError("Could not load selections"); }
    finally { setLoading(false); }
  }, [configured]);
  useEffect(() => { void load(); }, [load]);

  const selected = form ? selectCollectionWorks(form, works) : [];
  const availableTags = [...new Set(works.flatMap(work => normalizeTags(work.tags || [])))].sort();
  const filteredWorks = works.filter(work => `${work.title} ${work.artist || ""} ${(work.tags || []).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  function set<K extends keyof ArtistCollection>(key: K, value: ArtistCollection[K]) { setForm(previous => previous ? { ...previous, [key]: value } : null); }
  function open(value?: ArtistCollection) { setForm(value ? structuredClone(value) : blank()); setEditing(value?.slug || null); setSearch(""); setPreview(false); }
  function move(index: number, direction: number) { if (!form) return; const ids = [...form.work_ids]; const target = index + direction; if (target < 0 || target >= ids.length) return; [ids[index], ids[target]] = [ids[target], ids[index]]; set("work_ids", ids); }

  async function save() {
    if (!form || saving) return;
    const value = { ...form, slug: normalizeSlug(form.slug), tags: normalizeTags(form.tags), updated_at: new Date().toISOString() };
    if (!validSlug(value.slug)) { notify("Use 1–64 Latin letters, numbers, hyphens or underscores for the link", "error"); return; }
    const parsed = parseCollection(value);
    if (!parsed) { notify("Enter an artist and title, and check the selection fields", "error"); return; }
    if (parsed.published && !selectCollectionWorks(parsed, works).length) { notify("Add at least one work before publishing", "error"); return; }
    if (!configured) { notify("Supabase not connected", "error"); return; }
    setSaving(true);
    try {
      const db = createClient();
      const result = editing
        ? await db.from("wutshy_settings").update({ value: parsed }).eq("key", COLLECTION_PREFIX + editing).select("key")
        : await db.from("wutshy_settings").insert({ key: COLLECTION_PREFIX + parsed.slug, value: parsed }).select("key");
      if (result.error) { notify(result.error.code === "23505" ? "This link already exists. Choose another address." : "Could not save selection", "error"); return; }
      if (!result.data?.length) { notify("Could not save selection", "error"); return; }
      notify("Selection saved"); setForm(null); await load();
    } catch { notify("Could not save selection", "error"); }
    finally { setSaving(false); }
  }

  async function remove(collection: ArtistCollection) {
    if (!await confirm({ title: "Delete selection", message: `${collection.artist} — ${t("The artist link will stop working. Your works will not be deleted.")}` })) return;
    if (!configured) { notify("Supabase not connected", "error"); return; }
    try {
      const { error, data } = await createClient().from("wutshy_settings").delete().eq("key", COLLECTION_PREFIX + collection.slug).select("key");
      if (error || !data?.length) { notify("Could not delete selection", "error"); return; }
      notify("Deleted"); await load();
    } catch { notify("Could not delete selection", "error"); }
  }

  async function copy(slug: string) {
    try { await navigator.clipboard.writeText(new URL(collectionPath(slug), window.location.origin).href); notify("Link copied"); }
    catch { notify("Could not copy link. Use the displayed address.", "error"); }
  }

  return <div className="mx-auto max-w-6xl p-5 md:p-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-violet-300">WUTSHY / <T>DIRECT TO ARTIST</T></p><h1 className="mt-3 text-3xl font-semibold tracking-tight"><T>Artist selections</T></h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/45"><T>Personal links with hand-picked works and automatic tag matching.</T></p></div>{!form && <Button onClick={() => open()} disabled={loading || !!error}><span className="flex items-center gap-2"><Plus size={16} /><T>New selection</T></span></Button>}</div>
    <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-white/55"><T>Published selections are unlisted, not password-protected. Anyone with the link can open them. Tag matches update automatically as your catalogue changes.</T></p>
    {!configured && <p className="mt-4 rounded-xl bg-amber-200/5 p-4 text-xs text-amber-100/70"><T>Local preview with sample works. Connect Supabase to publish your selections.</T></p>}
    {error && <div role="alert" className="mt-6 text-sm text-red-300"><T>{error}</T><button onClick={load} className="ml-4 underline"><T>Retry</T></button></div>}
    {loading ? <p className="mt-8 text-white/40"><T>Loading...</T></p> : form ? <div className="mt-8 space-y-6">
      <div className="grid gap-5 rounded-2xl border border-white/10 p-5 sm:grid-cols-2">
        <Field label="Artist"><TextInput maxLength={80} value={form.artist} onChange={event => set("artist", event.target.value)} placeholder="Fimiquerro" /></Field>
        <Field label="Personal link" hint={editing ? "The address is fixed after creation" : "/beats/send/fimiquerro"}><TextInput maxLength={64} disabled={!!editing} value={form.slug} onChange={event => set("slug", normalizeSlug(event.target.value))} placeholder="fimiquerro" /></Field>
        <Field label="Title"><TextInput maxLength={120} value={form.title} onChange={event => set("title", event.target.value)} /></Field>
        <div className="flex items-center"><Toggle label="Published" checked={form.published} onChange={value => set("published", value)} /></div>
        <div className="sm:col-span-2"><Field label="Personal message"><TextArea maxLength={2000} rows={3} value={form.message} onChange={event => set("message", event.target.value)} /></Field></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 p-5"><h2 className="font-semibold"><T>Choose works individually</T></h2><TextInput aria-label={t("Search works")} placeholder="Search works" value={search} onChange={event => setSearch(event.target.value)} /><div className="mt-4 max-h-80 space-y-1 overflow-y-auto">{filteredWorks.map(work => <label key={work.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-3 hover:bg-white/5"><input type="checkbox" checked={form.work_ids.includes(work.id)} onChange={event => set("work_ids", event.target.checked ? [...form.work_ids, work.id] : form.work_ids.filter(id => id !== work.id))} className="h-4 w-4 accent-lime-300" /><span className="min-w-0 flex-1"><span className="block truncate text-sm">{work.title}</span><span className="text-[10px] text-white/35"><T>{work.type}</T> · {(work.tags || []).join(", ")}</span></span></label>)}{!filteredWorks.length && <p className="p-4 text-sm text-white/40"><T>No matching works</T></p>}</div></section>
        <section className="rounded-2xl border border-white/10 p-5"><h2 className="font-semibold"><T>Add automatically by tags</T></h2><p className="mt-2 text-xs leading-6 text-white/40"><T>Manual picks stay first. Matching works are added once, without duplicates.</T></p><div className="my-5 flex flex-wrap gap-2">{availableTags.map(tag => <button key={tag} aria-pressed={form.tags.includes(tag)} onClick={() => set("tags", form.tags.includes(tag) ? form.tags.filter(value => value !== tag) : [...form.tags, tag])} className={`rounded-full border px-3 py-1.5 text-xs ${form.tags.includes(tag) ? "border-lime-200 bg-lime-200 text-black" : "border-white/15 text-white/60"}`}>{tag}</button>)}{!availableTags.length && <p className="text-xs text-white/40"><T>Add tags to your works first</T></p>}</div><Field label="Tag matching"><Select value={form.tag_mode} onChange={event => set("tag_mode", event.target.value as "any" | "all")}><option value="any">{t("Any selected tag")}</option><option value="all">{t("All selected tags")}</option></Select></Field></section>
      </div>
      {form.work_ids.length > 0 && <section className="rounded-2xl border border-white/10 p-5"><h2 className="mb-3 text-sm font-semibold"><T>Manual order</T></h2>{form.work_ids.map((id, index) => <div key={id} className="flex items-center gap-3 border-b border-white/5 py-2"><span className="w-5 text-xs text-white/30">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm">{works.find(work => work.id === id)?.title || t("Unavailable work")}</span><button aria-label={t("Move up")} disabled={index === 0} onClick={() => move(index, -1)} className="p-2 disabled:opacity-20"><ArrowUp size={15} /></button><button aria-label={t("Move down")} disabled={index === form.work_ids.length - 1} onClick={() => move(index, 1)} className="p-2 disabled:opacity-20"><ArrowDown size={15} /></button></div>)}</section>}
      <section className="rounded-2xl bg-white/5 p-5"><p className="text-sm">{selected.length} <T>works selected</T></p><p className="mt-2 text-xs leading-6 text-white/45">{selected.map(work => work.title).join(" · ") || t("No matching works")}</p><button onClick={() => setPreview(!preview)} className="mt-4 text-xs text-violet-300 underline"><T>{preview ? "Close preview" : "Preview selection"}</T></button></section>
      {preview && <div className="overflow-hidden rounded-3xl bg-white text-black"><ArtistSelection collection={{ ...form, title: form.title || t("Selected for you") }} works={selected} demo={!configured} /></div>}
      <div className="sticky bottom-0 z-20 flex justify-end gap-3 rounded-2xl border border-white/10 bg-[#151518]/95 p-4 backdrop-blur-xl"><Button variant="ghost" disabled={saving} onClick={() => setForm(null)}><T>Cancel</T></Button><Button onClick={save} disabled={saving}><T>{saving ? "Saving..." : "Save selection"}</T></Button></div>
    </div> : <div className="mt-8 space-y-3">{collections.map(collection => <article key={collection.slug} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5"><ListMusic className="text-violet-300" size={22} /><div className="min-w-0 flex-1"><h2 className="font-semibold">{collection.artist}</h2><p className="mt-1 break-all text-xs text-white/40">{collectionPath(collection.slug)}</p><span className={`mt-2 inline-block text-[10px] ${collection.published ? "text-lime-200" : "text-white/35"}`}><T>{collection.published ? "Published" : "Draft"}</T> · {selectCollectionWorks(collection, works).length} <T>works selected</T></span></div><div className="flex gap-2"><button aria-label={t("Edit selection")} onClick={() => open(collection)} className="rounded-lg p-2 hover:bg-white/10"><Pencil size={16} /></button><button disabled={!collection.published} aria-label={t("Copy link")} onClick={() => copy(collection.slug)} className="rounded-lg p-2 hover:bg-white/10 disabled:opacity-25"><Copy size={16} /></button>{collection.published && <a href={collectionPath(collection.slug)} target="_blank" rel="noopener noreferrer" aria-label={t("Open selection")} className="rounded-lg p-2 hover:bg-white/10"><ExternalLink size={16} /></a>}<button aria-label={t("Delete selection")} onClick={() => remove(collection)} className="rounded-lg p-2 text-red-300 hover:bg-red-300/10"><Trash2 size={16} /></button></div></article>)}{!collections.length && !error && <p className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/40"><T>Create your first personal selection</T></p>}</div>}
  </div>;
}
