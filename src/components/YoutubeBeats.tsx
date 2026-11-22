"use client";
import { useState } from "react";
import { Play, Search } from "lucide-react";
import { T, useLocale } from "@/components/LocaleProvider";
import type { YoutubeBeat } from "@/lib/youtube-catalog";
export function YoutubeBeats({ videos }: { videos: YoutubeBeat[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(24);
  const [playing, setPlaying] = useState<string | null>(null);
  const filtered = videos.filter(video => video.title.toLowerCase().includes(query.toLowerCase()));
  return <div>
    <label className="mb-8 flex max-w-md items-center gap-3 rounded-full border border-black/10 px-4 py-3"><Search size={18} className="text-black/40" /><input value={query} onChange={e => { setQuery(e.target.value); setLimit(24); setPlaying(null); }} placeholder={t("Search videos")} aria-label={t("Search videos")} className="w-full bg-transparent text-sm outline-none" /></label>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.slice(0, limit).map(video => <article key={video.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="relative aspect-video min-h-[200px] bg-[#111]">{playing === video.id ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&playsinline=1&rel=0`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full" /> : <button className="group absolute inset-0 w-full" aria-label={`${t("Play video")}: ${video.title}`} onClick={() => setPlaying(video.id)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
        <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black transition-transform group-hover:scale-110"><Play size={20} fill="currentColor" /></span>
      </button>}</div>
      <div className="p-4"><h2 className="text-sm font-semibold leading-6">{video.title}</h2><a className="mt-3 inline-block text-sm text-black/50 underline hover:text-black" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer"><T>Watch on YouTube</T></a></div>
    </article>)}</div>
    {!filtered.length && <p className="text-black/50"><T>No videos found.</T></p>}
    {filtered.length > limit && <div className="mt-8 text-center"><button className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium hover:bg-black hover:text-white" onClick={() => setLimit(n => n + 24)}><T>Load more videos</T></button><p className="mt-3 text-sm text-black/40">{Math.min(limit, filtered.length)} / {filtered.length}</p></div>}
  </div>;
}
