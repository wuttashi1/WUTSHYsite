"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { T, useLocale } from "@/components/LocaleProvider";
import { carouselOffset, parseYoutube, type HomeVideo } from "@/lib/home-videos";
import styles from "./VideoCarousel.module.css";

export function VideoCarousel({ videos, title, subtitle, autoRotate = true }: { videos: HomeVideo[]; title: string; subtitle: string; autoRotate?: boolean }) {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const reducedMotion = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const count = videos.length;
  const rotating = autoRotate && !paused && !playing && !hovered && !focused && !reducedMotion && visible && foreground && count > 1;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    if (root.current) observer.observe(root.current);
    const onVisibility = () => setForeground(!document.hidden);
    onVisibility(); document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  useEffect(() => {
    if (!rotating) return;
    const timer = setInterval(() => setActive(i => (i + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [rotating, count]);
  function select(index: number) { setActive((index + count) % count); setPlaying(false); setPaused(true); }
  if (!count) return null;
  return <section ref={root} className={styles.section} aria-label={title || t("Videos")} aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    onKeyDown={e => { if ((e.target as HTMLElement).tagName === "SELECT") return; if (e.key === "ArrowLeft") { e.preventDefault(); select(active - 1); } if (e.key === "ArrowRight") { e.preventDefault(); select(active + 1); } if (e.key === "Escape") setPlaying(false); }}>
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="text-center"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-300">WUTSHY / VIDEO</p><h2 className="text-3xl font-bold md:text-5xl"><T>{title || "Videos"}</T></h2><p className="mt-3 text-white/60"><T>{subtitle || "Watch the latest from WUTSHY"}</T></p></div>
      <div className={styles.stage} onPointerDown={e => { gesture.current = { x: e.clientX, y: e.clientY }; dragged.current = false; }}
        onPointerUp={e => { const start = gesture.current; gesture.current = null; if (!start || playing) return; const dx = e.clientX - start.x; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - start.y)) { dragged.current = true; select(active + (dx < 0 ? 1 : -1)); } }}
        onPointerCancel={() => { gesture.current = null; }} onClickCapture={e => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}>
        {videos.map((video, index) => {
          const offset = carouselOffset(index, active, count);
          if (Math.abs(offset) > 2) return null;
          const parsed = parseYoutube(video.url)!;
          const portrait = video.format === "9:16" || (video.format === "auto" && parsed.portrait);
          const current = offset === 0;
          return <div key={`${video.id}-${index}`} className={`${styles.card} ${portrait ? styles.portrait : styles.landscape}`} style={{ transform: `translateX(calc(-50% + ${offset * 64}%)) translateZ(${-Math.abs(offset) * 180}px) rotateY(${offset * -22}deg)`, zIndex: 10 - Math.abs(offset), opacity: Math.abs(offset) === 2 ? 0.3 : current ? 1 : 0.65 }}>
            {current && playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&rel=0&playsinline=1`} title={video.title || t("Video")} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" /> :
              <button type="button" tabIndex={current ? 0 : -1} className={styles.preview} aria-label={`${t(current ? "Play video" : "Select video")}: ${video.title || index + 1}`} onClick={() => { if (current) { setPlaying(true); setPaused(true); } else select(index); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${parsed.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" draggable={false} />
                <span className={styles.play}><Play fill="currentColor" size={28} /></span>
                <span className={styles.caption}><span className="mb-2 block text-xs uppercase tracking-widest text-yellow-300">{portrait ? "SHORTS / 9:16" : "YOUTUBE / 16:9"}</span>{video.title || `Video ${index + 1}`}</span>
              </button>}
          </div>;
        })}
      </div>
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-3">
        <button className={styles.control} disabled={count < 2} aria-label={t("Previous video")} onClick={() => select(active - 1)}><ChevronLeft /></button>
        <span className="min-w-16 text-center text-sm text-white/60" aria-live={rotating ? "off" : "polite"}>{active + 1} / {count}</span>
        <button className={styles.control} disabled={count < 2} aria-label={t("Next video")} onClick={() => select(active + 1)}><ChevronRight /></button>
        {autoRotate && !reducedMotion && count > 1 && <button className={styles.control} aria-label={t(paused ? "Resume rotation" : "Pause rotation")} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>}
        {playing && <button className={styles.control} aria-label={t("Close video")} onClick={() => setPlaying(false)}><X size={20} /></button>}
      </div>
      <label className="mx-auto mt-5 flex max-w-xs items-center gap-3 text-sm text-white/60"><T>Select video</T><select value={active} onChange={e => select(Number(e.target.value))} className="min-w-0 flex-1 rounded-xl border border-white/20 bg-neutral-900 p-2 text-white">{videos.map((v, i) => <option key={i} value={i}>{v.title || `Video ${i + 1}`}</option>)}</select></label>
    </div>
  </section>;
}
