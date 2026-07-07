"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  folder?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = "audio/*,image/*",
  label = "Upload file",
  folder = "uploads",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { hoverProps } = useHoverSound(0.05);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured()) {
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/50">{label}</label>
      {value ? (
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
          <span className="flex-1 truncate text-white/70">{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-white/40 hover:text-white"
            {...hoverProps}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-6 text-sm text-white/40 transition-colors hover:border-white/40 hover:text-white/60"
          {...hoverProps}
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {uploading ? "Uploading..." : label}
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
