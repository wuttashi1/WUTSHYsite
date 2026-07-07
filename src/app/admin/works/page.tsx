"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_WORKS, parseTags } from "@/lib/data";
import { Work, WorkFormData, WorkType } from "@/types";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Toggle,
  Button,
  Modal,
  useToast,
  useConfirm,
} from "@/components/admin/ui";
import { Plus, Pencil, Trash2, Music, Search } from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";

const emptyForm: WorkFormData = {
  type: "beat",
  title: "",
  artist: "",
  description: "",
  cover_url: "",
  cover_video_url: "",
  audio_url: "",
  audio_before_url: "",
  spotify_url: "",
  spotify_type: "",
  price: "",
  currency: "EUR",
  bpm: "",
  musical_key: "",
  tags: "",
  accent_color: "#facc15",
  is_featured: false,
  sort_order: 0,
};

const typeColors: Record<string, string> = {
  beat: "bg-blue-500/20 text-blue-300",
  mixing: "bg-purple-500/20 text-purple-300",
  placement: "bg-yellow-500/20 text-yellow-300",
};

function WorksAdminContent() {
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const [works, setWorks] = useState<Work[]>([]);
  const [editing, setEditing] = useState<Work | null>(null);
  const [form, setForm] = useState<WorkFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [fetchingSpotify, setFetchingSpotify] = useState(false);
  const { hoverProps } = useHoverSound(0.05);

  const set = <K extends keyof WorkFormData>(k: K, v: WorkFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const fetchSpotifyMeta = async (rawUrl?: string) => {
    const url = (rawUrl ?? form.spotify_url).trim();
    if (!url || !/open\.spotify\.com\//i.test(url)) {
      notify("Paste a valid Spotify link first", "error");
      return;
    }
    setFetchingSpotify(true);
    try {
      const res = await fetch(`/api/spotify?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Could not fetch from Spotify", "error");
        return;
      }
      setForm((f) => ({
        ...f,
        spotify_url: url,
        spotify_type: data.type || f.spotify_type,
        title: f.title.trim() ? f.title : data.title || f.title,
        cover_url: f.cover_url.trim() ? f.cover_url : data.thumbnail_url || f.cover_url,
      }));
      notify("Pulled cover & data from Spotify");
    } catch {
      notify("Failed to reach Spotify", "error");
    } finally {
      setFetchingSpotify(false);
    }
  };

  const loadWorks = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setWorks(DEMO_WORKS);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("works").select("*").order("sort_order");
    setWorks((data as Work[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWorks();
    const newType = searchParams.get("new") as WorkType | null;
    if (newType) {
      setForm({ ...emptyForm, type: newType });
      setShowForm(true);
    }
  }, [searchParams, loadWorks]);

  const openNew = (type: WorkType = "beat") => {
    setEditing(null);
    setForm({ ...emptyForm, type });
    setShowForm(true);
  };

  const openEdit = (work: Work) => {
    setEditing(work);
    setForm({
      type: work.type,
      title: work.title,
      artist: work.artist || "",
      description: work.description || "",
      cover_url: work.cover_url || "",
      cover_video_url: work.cover_video_url || "",
      audio_url: work.audio_url || "",
      audio_before_url: work.audio_before_url || "",
      spotify_url: work.spotify_url || "",
      spotify_type: work.spotify_type || "",
      price: work.price?.toString() || "",
      currency: work.currency || "EUR",
      bpm: work.bpm?.toString() || "",
      musical_key: work.musical_key || "",
      tags: work.tags.join(", "),
      accent_color: work.accent_color || "#facc15",
      is_featured: work.is_featured,
      sort_order: work.sort_order,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      notify("Title is required", "error");
      return;
    }
    if (!isSupabaseConfigured()) {
      notify("Supabase not connected", "error");
      return;
    }

    const payload = {
      type: form.type,
      title: form.title.trim(),
      artist: form.artist || null,
      description: form.description || null,
      cover_url: form.cover_url || null,
      cover_video_url: form.cover_video_url || null,
      audio_url: form.audio_url || null,
      audio_before_url: form.audio_before_url || null,
      spotify_url: form.spotify_url || null,
      spotify_type: form.spotify_type || null,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      bpm: form.bpm ? parseInt(form.bpm) : null,
      musical_key: form.musical_key || null,
      tags: parseTags(form.tags),
      accent_color: form.accent_color,
      is_featured: form.is_featured,
      sort_order: form.sort_order,
    };

    setSaving(true);
    const supabase = createClient();
    const { error } = editing
      ? await supabase.from("works").update(payload).eq("id", editing.id)
      : await supabase.from("works").insert(payload);
    setSaving(false);

    if (error) {
      notify(error.message, "error");
      return;
    }
    notify(editing ? "Work updated" : "Work created");
    setShowForm(false);
    loadWorks();
  };

  const handleDelete = async (work: Work) => {
    const ok = await confirm({
      title: "Delete work",
      message: `"${work.title}" will be permanently removed.`,
    });
    if (!ok) return;
    if (!isSupabaseConfigured()) {
      notify("Supabase not connected", "error");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("works")
      .delete()
      .eq("id", work.id)
      .select("id");

    if (error) {
      notify(error.message, "error");
      return;
    }
    if (!data || data.length === 0) {
      notify("Nothing deleted — re-login and try again", "error");
      return;
    }
    notify("Deleted");
    loadWorks();
  };

  const filtered = works.filter(
    (w) =>
      (filter === "all" || w.type === filter) &&
      (search === "" || w.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Works</h1>
          <p className="mt-1 text-sm text-white/40">
            Beats, mixing portfolio, and placements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["beat", "mixing", "placement"] as WorkType[]).map((t) => (
            <Button key={t} variant="ghost" onClick={() => openNew(t)} {...hoverProps}>
              <span className="inline-flex items-center gap-1 capitalize">
                <Plus size={14} /> {t}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={14} className="text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-transparent text-sm outline-none placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          {["all", "beat", "mixing", "placement"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${
                filter === t ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-white/40">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-white/10 py-16 text-center text-white/40">
          <Music className="mx-auto mb-3" size={28} />
          Nothing here yet. Add your first work.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((work) => (
            <div
              key={work.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]"
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeColors[work.type]}`}
              >
                {work.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{work.title}</p>
                {work.artist && (
                  <p className="truncate text-xs text-white/40">{work.artist}</p>
                )}
              </div>
              {work.audio_url && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                  audio
                </span>
              )}
              {work.is_featured && (
                <span className="text-[10px] text-[#facc15]">★</span>
              )}
              <button
                onClick={() => openEdit(work)}
                className="text-white/40 transition-colors hover:text-white"
                {...hoverProps}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(work)}
                className="text-white/40 transition-colors hover:text-red-400"
                {...hoverProps}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Work" : "New Work"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                value={form.type}
                onChange={(e) => set("type", e.target.value as WorkType)}
              >
                <option value="beat">Beat</option>
                <option value="mixing">Mixing</option>
                <option value="placement">Placement</option>
              </Select>
            </Field>
            <Field label="Sort order">
              <TextInput
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
              />
            </Field>
          </div>

          <Field label="Title">
            <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <Field label="Artist / For (optional)">
            <TextInput value={form.artist} onChange={(e) => set("artist", e.target.value)} />
          </Field>

          <Field label="Description">
            <TextArea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <FileUpload
            label="Cover image"
            value={form.cover_url}
            onChange={(url) => set("cover_url", url)}
            accept="image/*"
            folder="covers"
          />

          <FileUpload
            label="Animated cover (gif / mp4 — plays while track plays)"
            value={form.cover_video_url}
            onChange={(url) => set("cover_video_url", url)}
            accept="image/gif,video/*"
            folder="covers"
          />

          <FileUpload
            label={form.type === "mixing" ? "Audio — AFTER (mixed)" : "Audio preview"}
            value={form.audio_url}
            onChange={(url) => set("audio_url", url)}
            accept="audio/*"
            folder="audio"
          />

          {form.type === "mixing" && (
            <FileUpload
              label="Audio — BEFORE (raw)"
              value={form.audio_before_url}
              onChange={(url) => set("audio_before_url", url)}
              accept="audio/*"
              folder="audio"
            />
          )}

          {form.type === "beat" && (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price">
                <TextInput
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </Field>
              <Field label="BPM">
                <TextInput
                  type="number"
                  value={form.bpm}
                  onChange={(e) => set("bpm", e.target.value)}
                />
              </Field>
              <Field label="Key">
                <TextInput
                  value={form.musical_key}
                  onChange={(e) => set("musical_key", e.target.value)}
                  placeholder="F# min"
                />
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Spotify URL">
              <TextInput
                value={form.spotify_url}
                onChange={(e) => set("spotify_url", e.target.value)}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && /open\.spotify\.com\//i.test(v)) fetchSpotifyMeta(v);
                }}
                placeholder="open.spotify.com/track/..."
              />
            </Field>
            <Field label="Spotify type">
              <Select
                value={form.spotify_type}
                onChange={(e) =>
                  set("spotify_type", e.target.value as WorkFormData["spotify_type"])
                }
              >
                <option value="">—</option>
                <option value="track">Track</option>
                <option value="playlist">Playlist</option>
                <option value="album">Album</option>
              </Select>
            </Field>
          </div>

          {form.spotify_url && (
            <Button
              variant="ghost"
              onClick={() => fetchSpotifyMeta()}
              disabled={fetchingSpotify}
              {...hoverProps}
            >
              {fetchingSpotify ? "Fetching..." : "Pull cover & data from Spotify"}
            </Button>
          )}

          <Field label="Tags (comma separated)">
            <TextInput
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="trap, melodic, dark"
            />
          </Field>

          {form.type === "placement" && (
            <Field label="Accent color">
              <input
                type="color"
                value={form.accent_color}
                onChange={(e) => set("accent_color", e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded-xl bg-transparent"
              />
            </Field>
          )}

          <Toggle
            checked={form.is_featured}
            onChange={(v) => set("is_featured", v)}
            label="Featured on homepage"
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} {...hoverProps}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function WorksAdminPage() {
  return (
    <Suspense>
      <WorksAdminContent />
    </Suspense>
  );
}
