"use client";

import { Work, SiteSettings } from "@/types";
import { motion } from "framer-motion";
import { formatPrice, workToTrack, getSpotifyEmbedUrl } from "@/lib/data";
import { AnimatedCover } from "@/components/player/AnimatedCover";
import { PlayButton } from "@/components/player/PlayButton";
import { PayPalButton } from "@/components/PayPalButton";
import { useHoverSound } from "@/hooks/useHoverSound";
import { WorkCard } from "@/components/WorkCard";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

interface BeatDetailProps {
  work: Work;
  related: Work[];
  payments: SiteSettings["payments"];
  contactEmail: string;
}

export function BeatDetail({ work, related, payments, contactEmail }: BeatDetailProps) {
  const { hoverProps } = useHoverSound();
  const track = workToTrack(work);
  const spotifyEmbed = work.spotify_url
    ? getSpotifyEmbedUrl(work.spotify_url, work.spotify_type)
    : null;
  const backHref = work.type === "mixing" ? "/mixing" : "/beats";

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
          {...hoverProps}
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <AnimatedCover
                trackId={work.id}
                coverUrl={work.cover_url}
                coverVideoUrl={work.cover_video_url}
                alt={work.title}
                fallbackChar={work.title.charAt(0).toUpperCase()}
                className="aspect-square w-full"
              />
              {work.audio_url && (
                <div className="absolute bottom-4 right-4">
                  <PlayButton track={track} size="lg" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {work.artist && (
              <p className="text-sm font-medium text-black/40">{work.artist}</p>
            )}
            <h1 className="text-3xl font-bold lowercase tracking-tight md:text-4xl">
              {work.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {work.price !== null && (
                <span className="text-2xl font-bold">
                  {formatPrice(work.price, work.currency)}
                </span>
              )}
              {work.bpm && (
                <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                  {work.bpm} BPM
                </span>
              )}
              {work.musical_key && (
                <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                  {work.musical_key}
                </span>
              )}
            </div>

            {work.description && (
              <p className="mt-6 leading-relaxed text-black/60">
                {work.description}
              </p>
            )}

            {work.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 space-y-3">
              {work.audio_url && (
                <div className="flex items-center gap-3 rounded-2xl bg-black px-5 py-3 text-white">
                  <PlayButton track={track} size="md" variant="light" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
              )}

              {payments.enabled &&
                payments.paypal_email &&
                work.price !== null &&
                work.type === "beat" && (
                  <PayPalButton
                    email={payments.paypal_email}
                    amount={work.price}
                    currency={work.currency}
                    itemName={`WUTSHY — ${work.title}`}
                  />
                )}

              {work.spotify_url ? (
                <a
                  href={work.spotify_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-black/10 px-6 py-3 text-center text-sm font-medium transition-colors hover:bg-black hover:text-white"
                  {...hoverProps}
                >
                  Listen on Spotify
                </a>
              ) : (
                !payments.enabled && (
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Purchase: ${work.title}`)}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-black hover:text-white"
                    {...hoverProps}
                  >
                    <Mail size={16} />
                    Contact to purchase
                  </a>
                )
              )}
            </div>

            {spotifyEmbed && (
              <iframe
                src={spotifyEmbed}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="mt-8 rounded-2xl"
              />
            )}
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 text-xl font-bold">More like this</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <WorkCard key={r.id} work={r} index={i} queue={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
