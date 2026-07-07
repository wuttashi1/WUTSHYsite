"use client";

import { SiteSettings } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useHoverSound } from "@/hooks/useHoverSound";
import { BackgroundBlobs } from "@/components/anim/BackgroundBlobs";
import { parseRotatingPhrases } from "@/lib/data";

interface HeroItem {
  id: string;
  title: string;
  cover_url: string | null;
  accent_color: string | null;
}

interface HeroSectionProps {
  settings: SiteSettings;
  items: HeroItem[];
}

const GRADIENTS = [
  "from-pink-400 to-purple-500",
  "from-purple-400 to-cyan-500",
  "from-green-300 to-cyan-400",
  "from-cyan-300 to-blue-400",
  "from-yellow-300 to-pink-400",
];

export function HeroSection({ settings, items }: HeroSectionProps) {
  const { hoverProps } = useHoverSound();
  const phrases = useMemo(
    () => parseRotatingPhrases(settings.content.hero.rotating_phrases),
    [settings.content.hero.rotating_phrases]
  );
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);

  const cards =
    items.length > 0
      ? items.slice(0, 5)
      : [
          { id: "a", title: "wutshy — kit", cover_url: null, accent_color: "#a3e635" },
          { id: "b", title: "beats", cover_url: null, accent_color: "#93c5fd" },
          { id: "c", title: "mixing", cover_url: null, accent_color: "#f0abfc" },
        ];

  useEffect(() => {
    if (!phrases.length) return;
    const t = setInterval(() => {
      setPhraseIdx((p) => (p + 1) % phrases.length);
      setCardIdx((c) => (c + 1) % cards.length);
    }, 2800);
    return () => clearInterval(t);
  }, [cards.length, phrases.length]);

  return (
    <section className="relative overflow-hidden py-16 md:py-28">
      <BackgroundBlobs />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
        <div className="relative mx-auto h-80 w-72 md:h-96 md:w-80">
          {cards.map((card, i) => {
            const offset = (i - cardIdx + cards.length) % cards.length;
            const isFront = offset === 0;
            const depth = Math.min(offset, 3);
            return (
              <motion.div
                key={card.id}
                className="absolute inset-0"
                initial={false}
                animate={{
                  scale: 1 - depth * 0.06,
                  y: depth * 14,
                  x: depth * 10,
                  rotate: isFront ? -3 : depth * 3,
                  opacity: depth > 3 ? 0 : 1,
                  zIndex: cards.length - depth,
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#111] shadow-2xl">
                  {card.cover_url ? (
                    <Image
                      src={card.cover_url}
                      alt={card.title}
                      fill
                      className="object-cover"
                      priority={isFront}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center text-white"
                      style={{
                        background:
                          card.accent_color || "#111",
                      }}
                    >
                      <span className="text-6xl font-black text-black/20">W</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">
                      {card.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-black/40"
          >
            {settings.content.hero.tagline}
          </motion.p>

          <h1 className="mt-2 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="block"
            >
              {settings.content.hero.title_prefix}
            </motion.span>
            <span className="relative block h-[1.15em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIdx}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block bg-gradient-to-r ${
                    GRADIENTS[phraseIdx % GRADIENTS.length]
                  } bg-clip-text text-transparent`}
                >
                  {phrases[phraseIdx] || phrases[0]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 max-w-md text-base text-black/50 md:text-lg"
          >
            {settings.content.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/beats"
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
              {...hoverProps}
            >
              {settings.content.hero.cta_primary}
            </Link>
            <Link
              href="/drum-kits"
              className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-black/5"
              {...hoverProps}
            >
              {settings.content.hero.cta_secondary}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
