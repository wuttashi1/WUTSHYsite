"use client";

import { Play, Pause } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { PlayerTrack } from "@/types";
import { useHoverSound } from "@/hooks/useHoverSound";
import { motion } from "framer-motion";

interface PlayButtonProps {
  track: PlayerTrack;
  queue?: PlayerTrack[];
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

const sizes = {
  sm: { btn: "h-8 w-8", icon: 14 },
  md: { btn: "h-10 w-10", icon: 16 },
  lg: { btn: "h-14 w-14", icon: 22 },
};

export function PlayButton({
  track,
  queue,
  size = "md",
  variant = "light",
}: PlayButtonProps) {
  const { toggleTrack, isCurrent, isPlaying } = usePlayer();
  const { playClick } = useHoverSound();
  const active = isCurrent(track.id);
  const showPause = active && isPlaying;
  const s = sizes[size];

  if (!track.audioUrl) {
    return (
      <div
        className={`flex ${s.btn} items-center justify-center rounded-full ${
          variant === "light" ? "bg-white/10 text-white/30" : "bg-black/10 text-black/30"
        }`}
      >
        <Play size={s.icon} className="ml-0.5" />
      </div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      onMouseEnter={playClick}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        playClick();
        toggleTrack(track, queue);
      }}
      className={`relative flex ${s.btn} shrink-0 items-center justify-center rounded-full shadow-lg transition-colors ${
        variant === "light"
          ? "bg-white text-black"
          : "bg-black text-white"
      }`}
      aria-label={showPause ? "Pause" : "Play"}
    >
      {active && isPlaying && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 0 2px rgba(250,204,21,0.5)" }}
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
      {showPause ? (
        <Pause size={s.icon} />
      ) : (
        <Play size={s.icon} className="ml-0.5" />
      )}
    </motion.button>
  );
}
