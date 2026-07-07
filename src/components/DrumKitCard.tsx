"use client";

import { DrumKit } from "@/types";
import { formatPrice, formatDuration, kitTrackToTrack } from "@/lib/data";
import { motion } from "framer-motion";
import { useHoverSound } from "@/hooks/useHoverSound";
import { AnimatedCover } from "@/components/player/AnimatedCover";
import { PlayButton } from "@/components/player/PlayButton";
import { usePlayer } from "@/context/PlayerContext";
import Link from "next/link";

interface DrumKitCardProps {
  kit: DrumKit;
  index?: number;
}

export function DrumKitCard({ kit, index = 0 }: DrumKitCardProps) {
  const { hoverProps } = useHoverSound();
  const { isCurrent, isPlaying } = usePlayer();
  const kitQueue = (kit.tracks || [])
    .filter((t) => t.audio_url)
    .map((t) => kitTrackToTrack(t, kit));

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-[#1a1a1a] text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
      {...hoverProps}
    >
      <div className="flex gap-4 p-5">
        <div className="relative h-20 w-20 shrink-0">
          <AnimatedCover
            trackId={kit.tracks?.[0]?.id}
            coverUrl={kit.cover_url}
            coverVideoUrl={kit.cover_video_url}
            alt={kit.title}
            className="h-full w-full"
            rounded="rounded-2xl"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold">{kit.title}</h3>
            {kit.is_new && (
              <span className="shrink-0 rounded-full bg-[#4ade80] px-2 py-0.5 text-[10px] font-bold text-black">
                NEW
              </span>
            )}
          </div>

          {kit.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {kit.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {kit.tracks && kit.tracks.length > 0 && (
        <div className="border-t border-white/5 px-3 py-2">
          {kit.tracks.slice(0, 3).map((track, i) => {
            const active = isCurrent(track.id) && isPlaying;
            return (
              <div
                key={track.id}
                className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition-colors ${
                  active ? "bg-white/5 text-white" : "text-white/60 hover:bg-white/5"
                }`}
              >
                <span className="w-4 text-xs text-white/30">{i + 1}</span>
                {track.audio_url ? (
                  <PlayButton
                    track={kitTrackToTrack(track, kit)}
                    queue={kitQueue}
                    size="sm"
                  />
                ) : (
                  <span className="h-8 w-8" />
                )}
                <span className="flex-1 truncate">{track.title}</span>
                <span className="text-xs text-white/30">
                  {formatDuration(track.duration_seconds)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-white/5 px-5 py-4">
        <span className="font-bold">{formatPrice(kit.price, kit.currency)}</span>
        <Link
          href={`/drum-kits/${kit.id}`}
          className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          {...hoverProps}
        >
          View
        </Link>
      </div>
    </motion.article>
  );
}
