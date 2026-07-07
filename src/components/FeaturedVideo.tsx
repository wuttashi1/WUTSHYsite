"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { getYoutubeEmbedUrl } from "@/lib/data";
import { Reveal } from "@/components/anim/Reveal";
import { useHoverSound } from "@/hooks/useHoverSound";

interface FeaturedVideoProps {
  youtubeUrl: string;
  title?: string;
  subtitle?: string;
  videoTitle?: string;
  author?: string;
  thumbnailUrl?: string;
}

export function FeaturedVideo({
  youtubeUrl,
  title,
  subtitle,
  videoTitle,
  author,
  thumbnailUrl,
}: FeaturedVideoProps) {
  const [playing, setPlaying] = useState(false);
  const { hoverProps } = useHoverSound();
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  if (!embedUrl) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            {title || "Featured Video"}
          </h2>
          <p className="mt-2 text-center text-sm text-black/50">
            {subtitle || "Watch the latest from WUTSHY"}
          </p>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 overflow-hidden rounded-3xl bg-black shadow-2xl shadow-black/10"
        >
          <div className="relative aspect-video w-full">
            {playing ? (
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={videoTitle || title || "Featured video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 h-full w-full"
                aria-label="Play video"
                {...hoverProps}
              >
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={videoTitle || "Video thumbnail"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-xl transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
                  <Play size={26} className="ml-1 fill-current" />
                </span>

                {(videoTitle || author) && (
                  <div className="absolute inset-x-0 bottom-0 p-5 text-left md:p-7">
                    {videoTitle && (
                      <h3 className="line-clamp-2 text-lg font-bold text-white md:text-2xl">
                        {videoTitle}
                      </h3>
                    )}
                    {author && (
                      <p className="mt-1 text-sm text-white/60">{author}</p>
                    )}
                  </div>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
