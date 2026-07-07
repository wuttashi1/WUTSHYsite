"use client";

import { Work } from "@/types";
import { motion } from "framer-motion";
import { useHoverSound } from "@/hooks/useHoverSound";
import { workToTrack } from "@/lib/data";
import { AnimatedCover } from "@/components/player/AnimatedCover";
import { PlayButton } from "@/components/player/PlayButton";
import { usePlayer } from "@/context/PlayerContext";
import Link from "next/link";

interface PlacementCardProps {
  work: Work;
  index?: number;
  queue?: Work[];
}

export function PlacementCard({ work, index = 0, queue }: PlacementCardProps) {
  const { hoverProps } = useHoverSound();
  const { isCurrent, isPlaying } = usePlayer();
  const bgColor = work.accent_color || "#facc15";
  const track = workToTrack(work);
  const playerQueue = queue?.map(workToTrack);
  const active = isCurrent(work.id) && isPlaying;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group overflow-hidden rounded-3xl card-hover"
      style={{ backgroundColor: bgColor }}
      {...hoverProps}
    >
      <Link href={`/beats/${work.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <AnimatedCover
            trackId={work.id}
            coverUrl={work.cover_url}
            coverVideoUrl={work.cover_video_url}
            alt={work.title}
            fallbackChar={work.title.charAt(0).toUpperCase()}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Placement
          </span>

          {work.audio_url && (
            <div className="absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <PlayButton track={track} queue={playerQueue} size="lg" />
            </div>
          )}

          {active && (
            <div className="absolute right-3 top-3 flex items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-black"
                  animate={{ height: [4, 14, 4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/beats/${work.id}`}>
          <h3 className="font-bold text-black transition-opacity hover:opacity-70">
            {work.title}
          </h3>
        </Link>
        {work.artist && (
          <p className="mt-0.5 text-sm font-medium text-black/70">
            {work.artist}
          </p>
        )}
        {work.description && (
          <p className="mt-1 text-sm text-black/60">{work.description}</p>
        )}
      </div>
    </motion.article>
  );
}
