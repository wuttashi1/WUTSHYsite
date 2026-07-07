"use client";

import { usePlayer } from "@/context/PlayerContext";
import { usePathname } from "next/navigation";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDuration, isVideo } from "@/lib/data";
import Image from "next/image";
import { useRef } from "react";

export function PlayerBar() {
  const {
    current,
    isPlaying,
    toggle,
    next,
    prev,
    progress,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
  } = usePlayer();
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  if (pathname.startsWith("/admin")) return null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, percent)));
  };

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2"
          ref={barRef}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]/95 shadow-2xl backdrop-blur-xl">
            <div
              className="group h-1 cursor-pointer bg-white/10"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-[#facc15] transition-all group-hover:bg-[#fde047]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 text-white sm:gap-4 sm:px-4">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#222]">
                {current.coverVideoUrl && isVideo(current.coverVideoUrl) && isPlaying ? (
                  <video
                    src={current.coverVideoUrl}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : current.coverVideoUrl && !isVideo(current.coverVideoUrl) && isPlaying ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.coverVideoUrl} alt="" className="h-full w-full object-cover" />
                ) : current.coverUrl ? (
                  <Image src={current.coverUrl} alt={current.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold text-white/20">
                    W
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{current.title}</p>
                {current.subtitle && (
                  <p className="truncate text-xs text-white/40">
                    {current.subtitle}
                  </p>
                )}
              </div>

              <span className="hidden text-xs tabular-nums text-white/40 sm:block">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={prev}
                  className="text-white/50 transition-colors hover:text-white"
                  aria-label="Previous"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={toggle}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <button
                  onClick={next}
                  className="text-white/50 transition-colors hover:text-white"
                  aria-label="Next"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <Volume2 size={15} className="text-white/40" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="h-1 w-20 cursor-pointer accent-[#facc15]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
