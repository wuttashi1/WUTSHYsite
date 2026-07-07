"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_DRUM_KITS, parseTags } from "@/lib/data";
import { DrumKit, DrumKitFormData, DrumKitTrack } from "@/types";
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
import { Plus, Pencil, Trash2, Disc3, GripVertical } from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";

const emptyForm: DrumKitFormData = {
  title: "",
  description: "",
  price: "",
  currency: "EUR",
  cover_url: "",
  cover_video_url: "",
  buy_url: "",
  tags: "",
  is_new: false,
  is_featured: false,
  sort_order: 0,
};

interface TrackForm {
  title: string;
  audio_url: string;
  duration_seconds: string;
}

function DrumKitsAdminContent() {
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const [kits, setKits] = useState<DrumKit[]>([]);
  const [editing, setEditing] = useState<DrumKit | null>(null);
  const [form, setForm] = useState<DrumKitFormData>(emptyForm);
  const [tracks, setTracks] = useState<TrackForm[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedKit, setExpandedKit] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { hoverProps } = useHoverSound(0.05);

  const set = <K extends keyof DrumKitFormData>(k: K, v: DrumKitFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const loadKits = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setKits(DEMO_DRUM_KITS);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data: kitsData } = await supabase
      .from("drum_kits")
      .select("*")
      .order("sort_order");
    const { data: tracksData } = await supabase
      .from("drum_kit_tracks")
      .select("*")
      .order("sort_order");

    setKits(
      (kitsData || []).map((kit) => ({
        ...kit,
        tracks: (tracksData || []).filter(
          (t: DrumKitTrack) => t.drum_kit_id === kit.id
        ),
      })) as DrumKit[]
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadKits();
    if (searchParams.get("new")) {
      setForm(emptyForm);
      setTracks([]);
      setShowForm(true);
    }
  }, [searchParams, loadKits]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setTracks([]);
    setShowForm(true);
  };

  const openEdit = (kit: DrumKit) => {
    setEditing(kit);
    setForm({
      title: kit.title,
      description: kit.description || "",
      price: kit.price?.toString() || "",
      currency: kit.currency,
      cover_url: kit.cover_url || "",
      cover_video_url: kit.cover_video_url || "",
      buy_url: kit.buy_url || "",
      tags: kit.tags.join(", "),
      is_new: kit.is_new,
      is_featured: kit.is_featured,
      sort_order: kit.sort_order,
    });
    setTracks(
      (kit.tracks || []).map((t) => ({
        title: t.title,
        audio_url: t.audio_url || "",
        duration_seconds: t.duration_seconds?.toString() || "",
      }))
    );
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
      title: form.title.trim(),
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      cover_url: form.cover_url || null,
      cover_video_url: form.cover_video_url || null,
      buy_url: form.buy_url || null,
      tags: parseTags(form.tags),
      is_new: form.is_new,
      is_featured: form.is_featured,
      sort_order: form.sort_order,
    };

    setSaving(true);
    const supabase = createClient();
    let kitId = editing?.id;

    if (editing) {
      const { error } = await supabase
        .from("drum_kits")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        setSaving(false);
        notify(error.message, "error");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("drum_kits")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        setSaving(false);
        notify(error.message, "error");
        return;
      }
      kitId = data?.id;
    }

    if (kitId) {
      await supabase.from("drum_kit_tracks").delete().eq("drum_kit_id", kitId);
      const valid = tracks.filter((t) => t.title.trim());
      if (valid.length > 0) {
        await supabase.from("drum_kit_tracks").insert(
          valid.map((t, i) => ({
            drum_kit_id: kitId,
            title: t.title.trim(),
            audio_url: t.audio_url || null,
            duration_seconds: t.duration_seconds
              ? parseInt(t.duration_seconds)
              : null,
            sort_order: i,
          }))
        );
      }
    }

    setSaving(false);
    notify(editing ? "Kit updated" : "Kit created");
    setShowForm(false);
    loadKits();
  };

  const handleDeleteTrack = async (trackId: string, title: string) => {
    const ok = await confirm({
      title: "Delete track",
      message: `"${title}" will be removed from this kit.`,
    });
    if (!ok) return;
    if (!isSupabaseConfigured()) {
      notify("Supabase not connected", "error");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("drum_kit_tracks")
      .delete()
      .eq("id", trackId)
      .select("id");

    if (error) {
      notify(error.message, "error");
      return;
    }
    if (!data || data.length === 0) {
      notify("Nothing deleted — re-login and try again", "error");
      return;
    }
    notify("Track deleted");
    loadKits();
  };

  const handleDelete = async (kit: DrumKit) => {
    const ok = await confirm({
      title: "Delete drum kit",
      message: `"${kit.title}" and all its tracks will be permanently removed.`,
    });
    if (!ok) return;
    if (!isSupabaseConfigured()) {
      notify("Supabase not connected", "error");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("drum_kits")
      .delete()
      .eq("id", kit.id)
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
    loadKits();
  };

  const addTrack = () =>
    setTracks((t) => [...t, { title: "", audio_url: "", duration_seconds: "" }]);
  const updateTrack = (i: number, field: keyof TrackForm, value: string) =>
    setTracks((t) => t.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));
  const removeTrack = (i: number) =>
    setTracks((t) => t.filter((_, idx) => idx !== i));

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drum Kits</h1>
          <p className="mt-1 text-sm text-white/40">
            Kits, tracklists, pricing and buy links.
          </p>
        </div>
        <Button onClick={openNew} {...hoverProps}>
          <span className="inline-flex items-center gap-1">
            <Plus size={16} /> New kit
          </span>
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-white/40">Loading...</p>
      ) : kits.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-white/10 py-16 text-center text-white/40">
          <Disc3 className="mx-auto mb-3" size={28} />
          No kits yet. Create your first one.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/30">
                  <Disc3 size={20} />
                </div>
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() =>
                    setExpandedKit(expandedKit === kit.id ? null : kit.id)
                  }
                >
                  <p className="truncate text-sm font-medium">{kit.title}</p>
                  <p className="text-xs text-white/40">
                    {kit.tracks?.length || 0} tracks
                    {kit.price ? ` · ${kit.price} ${kit.currency}` : ""}
                    <span className="ml-2 text-white/20">
                      {expandedKit === kit.id ? "▲" : "▼"}
                    </span>
                  </p>
                </button>
                {kit.is_new && (
                  <span className="rounded-full bg-[#4ade80] px-1.5 py-0.5 text-[10px] font-bold text-black">
                    NEW
                  </span>
                )}
                <button
                  onClick={() => openEdit(kit)}
                  className="text-white/40 transition-colors hover:text-white"
                  {...hoverProps}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(kit)}
                  className="text-white/40 transition-colors hover:text-red-400"
                  {...hoverProps}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {expandedKit === kit.id && kit.tracks && kit.tracks.length > 0 && (
                <div className="border-t border-white/5 px-4 py-3">
                  {kit.tracks.map((track, i) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 py-1.5 text-sm text-white/60"
                    >
                      <span className="w-5 text-xs text-white/30">{i + 1}</span>
                      <span className="flex-1 truncate">{track.title}</span>
                      <button
                        onClick={() => handleDeleteTrack(track.id, track.title)}
                        className="text-white/30 hover:text-red-400"
                        title="Delete track"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Edit Drum Kit" : "New Drum Kit"}
      >
        <div className="space-y-4">
          <Field label="Title">
            <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <Field label="Description">
            <TextArea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price">
              <TextInput
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </Field>
            <Field label="Currency">
              <Select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
              </Select>
            </Field>
          </div>

          <FileUpload
            label="Cover image"
            value={form.cover_url}
            onChange={(url) => set("cover_url", url)}
            accept="image/*"
            folder="covers"
          />

          <FileUpload
            label="Animated cover (gif / mp4)"
            value={form.cover_video_url}
            onChange={(url) => set("cover_video_url", url)}
            accept="image/gif,video/*"
            folder="covers"
          />

          <Field label="Buy link (optional)">
            <TextInput
              value={form.buy_url}
              onChange={(e) => set("buy_url", e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <Field label="Tags (comma separated)">
            <TextInput
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="drums, oneshots, midi"
            />
          </Field>

          <div className="flex gap-6">
            <Toggle checked={form.is_new} onChange={(v) => set("is_new", v)} label="NEW badge" />
            <Toggle
              checked={form.is_featured}
              onChange={(v) => set("is_featured", v)}
              label="Featured"
            />
          </div>

          <div className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50">
                Tracklist ({tracks.length})
              </span>
              <button
                type="button"
                onClick={addTrack}
                className="text-xs font-medium text-[#facc15]"
                {...hoverProps}
              >
                + Add track
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {tracks.map((track, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-white/20" />
                    <input
                      value={track.title}
                      onChange={(e) => updateTrack(i, "title", e.target.value)}
                      placeholder="Track title"
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                    />
                    <input
                      value={track.duration_seconds}
                      onChange={(e) =>
                        updateTrack(i, "duration_seconds", e.target.value)
                      }
                      placeholder="sec"
                      type="number"
                      className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={() => removeTrack(i)}
                      className="text-white/40 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-2">
                    <FileUpload
                      label="Audio"
                      value={track.audio_url}
                      onChange={(url) => updateTrack(i, "audio_url", url)}
                      accept="audio/*"
                      folder="audio"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

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

export default function DrumKitsAdminPage() {
  return (
    <Suspense>
      <DrumKitsAdminContent />
    </Suspense>
  );
}
