"use client";

import { DrumKit, SiteSettings } from "@/types";
import { formatPrice, formatDuration, kitTrackToTrack } from "@/lib/data";
import { motion } from "framer-motion";
import { AnimatedCover } from "@/components/player/AnimatedCover";
import { PlayButton } from "@/components/player/PlayButton";
import { usePlayer } from "@/context/PlayerContext";
import { useHoverSound } from "@/hooks/useHoverSound";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PayPalButton } from "@/components/PayPalButton";
import { Mail } from "lucide-react";

export function KitDetail({
  kit,
  payments,
  contactEmail,
}: {
  kit: DrumKit;
  payments: SiteSettings["payments"];
  contactEmail: string;
}) {
  const { isCurrent, isPlaying } = usePlayer();
  const { hoverProps } = useHoverSound();
  const queue = (kit.tracks || [])
    .filter((t) => t.audio_url)
    .map((t) => kitTrackToTrack(t, kit));

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Link
          href="/drum-kits"
          className="mb-6 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
          {...hoverProps}
        >
          <ArrowLeft size={16} /> Back to kits
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <AnimatedCover
              trackId={kit.tracks?.[0]?.id}
              coverUrl={kit.cover_url}
              coverVideoUrl={kit.cover_video_url}
              alt={kit.title}
              className="aspect-square w-full rounded-3xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold md:text-4xl">{kit.title}</h1>
            {kit.price !== null && (
              <p className="mt-2 text-2xl font-bold">
                {formatPrice(kit.price, kit.currency)}
              </p>
            )}

            {kit.description && (
              <p className="mt-6 leading-relaxed text-black/60">
                {kit.description}
              </p>
            )}

            {kit.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {kit.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 space-y-3">
              {payments.enabled && payments.paypal_email && kit.price !== null ? (
                <PayPalButton
                  email={payments.paypal_email}
                  amount={kit.price}
                  currency={kit.currency}
                  itemName={`WUTSHY — ${kit.title}`}
                />
              ) : kit.buy_url ? (
                <a
                  href={kit.buy_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-2xl bg-black py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-black/80"
                  {...hoverProps}
                >
                  Buy now
                </a>
              ) : (
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Purchase: ${kit.title}`)}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 py-3.5 text-sm font-medium transition-colors hover:bg-black hover:text-white"
                  {...hoverProps}
                >
                  <Mail size={16} />
                  Contact to purchase
                </a>
              )}
            </div>

            {kit.tracks && kit.tracks.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 font-bold">Preview ({kit.tracks.length})</h3>
                <div className="space-y-1">
                  {kit.tracks.map((track, i) => {
                    const active = isCurrent(track.id) && isPlaying;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                          active ? "bg-black/5" : "hover:bg-black/[0.03]"
                        }`}
                      >
                        <span className="w-5 text-xs text-black/30">{i + 1}</span>
                        {track.audio_url ? (
                          <PlayButton
                            track={kitTrackToTrack(track, kit)}
                            queue={queue}
                            size="sm"
                            variant="dark"
                          />
                        ) : (
                          <span className="h-8 w-8" />
                        )}
                        <span className="flex-1 truncate text-sm">
                          {track.title}
                        </span>
                        <span className="text-xs text-black/30">
                          {formatDuration(track.duration_seconds)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
