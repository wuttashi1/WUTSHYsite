"use client";

import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";
import { isVideo } from "@/lib/data";
import { useEffect, useRef } from "react";

interface AnimatedCoverProps {
  trackId?: string;
  coverUrl?: string | null;
  coverVideoUrl?: string | null;
  alt: string;
  fallbackChar?: string;
  className?: string;
  rounded?: string;
}

export function AnimatedCover({
  trackId,
  coverUrl,
  coverVideoUrl,
  alt,
  fallbackChar = "W",
  className = "",
  rounded = "",
}: AnimatedCoverProps) {
  const { isCurrent, isPlaying } = usePlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = trackId ? isCurrent(trackId) && isPlaying : false;
  const hasVideo = !!coverVideoUrl;
  const videoIsVideoFile = isVideo(coverVideoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-500 ${
            active && hasVideo ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
          <span className="text-4xl font-black text-white/10">
            {fallbackChar}
          </span>
        </div>
      )}

      {hasVideo && videoIsVideoFile && (
        <video
          ref={videoRef}
          src={coverVideoUrl!}
          muted
          loop
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {hasVideo && !videoIsVideoFile && active && (
        // GIF (image) animated cover
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverVideoUrl!}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
