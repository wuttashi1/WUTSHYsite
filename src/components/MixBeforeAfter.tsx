"use client";

import { Work } from "@/types";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { formatDuration } from "@/lib/data";
import { useHoverSound } from "@/hooks/useHoverSound";
import Image from "next/image";

type Mode = "before" | "after";

export function MixBeforeAfter({ work, index = 0 }: { work: Work; index?: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<Mode>("after");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { hoverProps, playClick } = useHoverSound();

  const beforeUrl = work.audio_before_url;
  const afterUrl = work.audio_url;
  const currentUrl = mode === "before" ? beforeUrl : afterUrl;
  const hasBoth = !!beforeUrl && !!afterUrl;

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    const onTime = () => {
      setTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !currentUrl) return;
    playClick();
    if (!audio.src.includes(encodeURI(currentUrl)) && audio.src !== currentUrl) {
      audio.src = currentUrl;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    const audio = audioRef.current;
    playClick();
    setMode(newMode);
    const url = newMode === "before" ? beforeUrl : afterUrl;
    if (!audio || !url) return;
    const wasPlaying = !audio.paused;
    const pos = audio.currentTime;
    audio.src = url;
    audio.currentTime = pos || 0;
    if (wasPlaying) audio.play().catch(() => {});
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
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
              {work.title.charAt(0).toUpperCase()}
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
          {mode === "before" ? "Raw" : "Mixed & Mastered"}
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
            <h3 className="truncate text-lg font-bold">{work.title}</h3>
            {work.artist && <p className="text-xs text-white/40">{work.artist}</p>}
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
                {m === "before" ? "Before (raw)" : "After (mix)"}
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
              {formatDuration(time)} / {formatDuration(duration)}
            </span>
          </div>
        )}

        {work.description && (
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            {work.description}
          </p>
        )}
      </div>
    </motion.article>
  );
}
