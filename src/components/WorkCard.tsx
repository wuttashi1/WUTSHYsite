"use client";

import { Work } from "@/types";
import { motion } from "framer-motion";
import { useHoverSound } from "@/hooks/useHoverSound";
import { workToTrack, formatPrice } from "@/lib/data";
import { AnimatedCover } from "@/components/player/AnimatedCover";
import { PlayButton } from "@/components/player/PlayButton";
import { usePlayer } from "@/context/PlayerContext";
import Link from "next/link";

interface WorkCardProps {
  work: Work;
  index?: number;
  queue?: Work[];
}

export function WorkCard({ work, index = 0, queue }: WorkCardProps) {
  const { hoverProps } = useHoverSound();
  const { isCurrent, isPlaying } = usePlayer();
  const track = workToTrack(work);
  const playerQueue = queue?.map(workToTrack);
  const active = isCurrent(work.id) && isPlaying;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl bg-[#111] text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
      {...hoverProps}
    >
      <Link href={`/beats/${work.id}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden">
          <AnimatedCover
            trackId={work.id}
            coverUrl={work.cover_url}
            coverVideoUrl={work.cover_video_url}
            alt={work.title}
            fallbackChar={work.title.charAt(0).toUpperCase()}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {work.audio_url && (
            <div className="absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <PlayButton track={track} queue={playerQueue} size="lg" />
            </div>
          )}

          {(work.bpm || work.musical_key) && (
            <div className="absolute left-3 top-3 flex gap-1.5">
              {work.bpm && (
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
                  {work.bpm} BPM
                </span>
              )}
              {work.musical_key && (
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
                  {work.musical_key}
                </span>
              )}
            </div>
          )}

          {active && (
            <div className="absolute right-3 top-3 flex items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-[#facc15]"
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

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/beats/${work.id}`} className="min-w-0">
            <h3 className="truncate text-lg font-bold lowercase transition-colors group-hover:text-[#facc15]">
              {work.title}
            </h3>
            {work.artist && (
              <p className="text-xs text-white/40">{work.artist}</p>
            )}
          </Link>
          {work.price !== null && (
            <span className="shrink-0 text-sm font-bold">
              {formatPrice(work.price, work.currency)}
            </span>
          )}
        </div>

        {work.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/50">
            {work.description}
          </p>
        )}

        {work.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
