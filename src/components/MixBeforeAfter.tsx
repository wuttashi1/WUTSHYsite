"use client";


import { T } from "@/components/LocaleProvider";
import { Work, PlayerTrack } from "@/types";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { workToTrack, formatDuration } from "@/lib/data";
import { useHoverSound } from "@/hooks/useHoverSound";
import Image from "next/image";

type Mode = "before" | "after";

export function MixBeforeAfter({ work, queue, index = 0 }: { work: Work; queue: PlayerTrack[]; index?: number }) {
  const player = usePlayer();
  const [selection, setSelection] = useState<Mode>(work.audio_url ? "after" : "before");
  const { hoverProps, playClick } = useHoverSound();
  const active = player.current?.id === work.id;
  const mode = active ? (player.current?.audioUrl === work.audio_before_url ? "before" : "after") : selection;
  const currentUrl = mode === "before" ? work.audio_before_url : work.audio_url;
  const hasBoth = !!work.audio_before_url && !!work.audio_url;
  const playing = active && player.isPlaying;
  const time = active ? player.currentTime : 0;
  const duration = active ? player.duration : 0;

  const toggle = () => {
    if (!currentUrl) return;
    playClick();
    player.toggleTrack({ ...workToTrack(work), audioUrl: currentUrl }, queue);
  };

  const switchMode = (newMode: Mode) => {
    if (mode === newMode) return;
    playClick();
    setSelection(newMode);
    const url = newMode === "before" ? work.audio_before_url : work.audio_url;
    if (active && url) player.switchVersion({ ...workToTrack(work), audioUrl: url });
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    player.seek(Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100)));
  };

  const rawFilter =
    mode === "before" ? "contrast(0.82) saturate(0.6) brightness(0.92)" : "none";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl bg-[#111] text-white"
      {...hoverProps}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {work.cover_url ? (
          <Image
            src={work.cover_url}
            alt={work.title}
            fill
            className="object-cover transition-all duration-500"
            style={{ filter: rawFilter }}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center bg-[#1a1a1a] transition-all duration-500"
            style={{ filter: rawFilter }}
          >
            <span className="text-5xl font-black text-white/10">
              <T>{work.title.charAt(0).toUpperCase()}</T>
            </span>
          </div>
        )}

        <motion.span
          key={mode}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur ${
            mode === "before"
              ? "bg-black/70 text-white/70"
              : "bg-[#facc15] text-black"
          }`}
        >
          <T>{mode === "before" ? "Raw" : "Mixed & Mastered"}</T>
        </motion.span>

        {currentUrl && (
          <button
            onClick={toggle}
            className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold"><T>{work.title}</T></h3>
            {work.artist && <p className="text-xs text-white/40"><T>{work.artist}</T></p>}
          </div>
        </div>

        {hasBoth && (
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-white/5 p-1">
            {(["before", "after"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`rounded-full py-2 text-xs font-medium capitalize transition-colors ${
                  mode === m ? "bg-white text-black" : "text-white/50 hover:text-white"
                }`}
              >
                <T>{m === "before" ? "Before (raw)" : "After (mix)"}</T>
              </button>
            ))}
          </div>
        )}

        {currentUrl && (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="group h-1.5 flex-1 cursor-pointer rounded-full bg-white/10"
              onClick={seek}
            >
              <div
                className="h-full rounded-full bg-[#facc15]"
                style={{ width: duration ? `${(time / duration) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs tabular-nums text-white/40">
              <T>{formatDuration(time)}</T> / <T>{formatDuration(duration)}</T>
            </span>
          </div>
        )}

        {work.description && (
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            <T>{work.description}</T>
          </p>
        )}
      </div>
    </motion.article>
  );
}
