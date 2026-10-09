"use client";
import { Play, Music2, ArrowUpRight } from "lucide-react";
import { T } from "@/components/LocaleProvider";
import { usePlayer } from "@/context/PlayerContext";
import { workToTrack } from "@/lib/data";
import { WorkCard } from "@/components/WorkCard";
import type { ArtistCollection } from "@/lib/collections";
import type { Work } from "@/types";

export function ArtistSelection({ collection, works, demo }: { collection: ArtistCollection; works: Work[]; demo: boolean }) {
  const { playTrack } = usePlayer();
  const playable = works.filter(work => work.audio_url).map(workToTrack);
  return <div className="pb-24">
    <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-br from-violet-100/70 via-white to-lime-100/50">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-24">
        <p className="eyebrow"><Music2 size={14} /> WUTSHY / <T>PERSONAL SELECTION</T></p>
        <p className="mt-9 text-sm text-black/45"><T>Prepared for</T> {collection.artist}</p>
        <h1 className="mt-3 max-w-4xl break-words text-4xl font-semibold leading-tight tracking-[-.045em] md:text-6xl"><T>{collection.title}</T></h1>
        {collection.message && <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-black/55"><T>{collection.message}</T></p>}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button disabled={!playable.length} onClick={() => { if (playable[0]) playTrack(playable[0], playable); }} className="portfolio-button bg-black text-white disabled:opacity-35"><Play size={16} /><T>Play selection</T></button>
          <span className="text-xs text-black/45">{works.length} <T>works selected</T></span>
          <a href="#contact" className="inline-flex items-center gap-2 text-sm"><T>Get in touch</T><ArrowUpRight size={15} /></a>
        </div>
        {demo && <p className="mt-6 text-xs text-amber-800"><T>Local preview with sample works. Connect Supabase to publish your selections.</T></p>}
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-6">
      {works.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{works.map((work, index) => <WorkCard key={work.id} work={work} index={index} queue={works.filter(item => item.audio_url)} />)}</div> : <p className="rounded-3xl border border-dashed border-black/10 p-12 text-center text-black/45"><T>The selection is being updated. Please check back soon.</T></p>}
    </section>
  </div>;
}
