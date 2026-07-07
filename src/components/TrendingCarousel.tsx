"use client";

import { Work } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useHoverSound } from "@/hooks/useHoverSound";
import { PlayButton } from "@/components/player/PlayButton";
import { workToTrack } from "@/lib/data";

export function TrendingCarousel({ items }: { items: Work[] }) {
  const { hoverProps } = useHoverSound(0.05);
  if (items.length === 0) return null;
  const queue = items.map(workToTrack);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
      >
        <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#111] px-5 py-4 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#facc15] text-sm font-bold text-black">
            W
          </span>
          <span className="text-sm font-bold uppercase tracking-wide">
            Trending now
          </span>
        </div>

        {items.map((work, i) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group flex shrink-0 items-center gap-3 rounded-2xl bg-[#111] px-4 py-3 text-white transition-colors hover:bg-[#1a1a1a]"
            {...hoverProps}
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#222]">
              {work.cover_url ? (
                <Image src={work.cover_url} alt={work.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-white/20">
                  W
                </div>
              )}
            </div>
            <Link href={`/beats/${work.id}`} className="min-w-0">
              <p className="truncate text-sm font-semibold lowercase">
                {work.title}
              </p>
              <p className="truncate text-xs text-white/40">
                {work.tags.slice(0, 2).join(" · ") || work.type}
              </p>
            </Link>
            {work.audio_url && (
              <PlayButton track={workToTrack(work)} queue={queue} size="sm" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
