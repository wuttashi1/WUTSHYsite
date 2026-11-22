"use client";
import { Button, Field, Select, TextInput, Toggle } from "./ui";
import { T } from "@/components/LocaleProvider";
import { homeVideos, parseYoutube, type HomeVideo } from "@/lib/home-videos";
import type { SiteSettings } from "@/types";

type Settings = SiteSettings["featured_video"];
export function HomeVideosSettings({ value, onChange }: { value: Settings; onChange: (value: Settings) => void }) {
  const videos = value.videos ?? homeVideos(value);
  function update(index: number, patch: Partial<HomeVideo>) { onChange({ ...value, videos: videos.map((v, i) => i === index ? { ...v, ...patch } : v) }); }
  function move(index: number, delta: number) { const next = [...videos]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange({ ...value, videos: next }); }
  return <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <h2 className="font-bold"><T>Homepage videos</T></h2>
    <Toggle label="Show videos on homepage" checked={value.enabled} onChange={enabled => onChange({ ...value, enabled })} />
    <Toggle label="Automatically rotate cards" checked={value.auto_rotate !== false} onChange={auto_rotate => onChange({ ...value, auto_rotate })} />
    <Field label="Section title (optional)"><TextInput value={value.title} onChange={e => onChange({ ...value, title: e.target.value })} /></Field>
    <p className="text-sm text-white/50"><T>Add YouTube videos or Shorts. Drag on the homepage to browse. Videos play only when selected.</T></p>
    {videos.map((video, index) => <div key={video.id} className="space-y-3 rounded-xl border border-white/10 p-4">
      <Field label="YouTube URL"><TextInput value={video.url} onChange={e => update(index, { url: e.target.value })} placeholder="https://youtube.com/shorts/..." aria-invalid={!!video.url && !parseYoutube(video.url)} /></Field>
      {video.url && !parseYoutube(video.url) && <p role="alert" className="text-sm text-red-300"><T>Enter a valid HTTPS YouTube video or Shorts link.</T></p>}
      <Field label="Video title"><TextInput value={video.title} onChange={e => update(index, { title: e.target.value })} /></Field>
      <Field label="Video format"><Select value={video.format} onChange={e => update(index, { format: e.target.value as HomeVideo["format"] })}><option value="auto">Auto / Shorts → 9:16</option><option value="16:9">YouTube · 16:9</option><option value="9:16">Shorts · 9:16</option></Select></Field>
      <div className="flex flex-wrap gap-2"><Button variant="ghost" disabled={index === 0} onClick={() => move(index, -1)}><T>Move up</T></Button><Button variant="ghost" disabled={index === videos.length - 1} onClick={() => move(index, 1)}><T>Move down</T></Button><Button variant="danger" onClick={() => onChange({ ...value, videos: videos.filter((_, i) => i !== index) })}><T>Remove video</T></Button></div>
    </div>)}
    <Button variant="ghost" onClick={() => onChange({ ...value, videos: [...videos, { id: crypto.randomUUID(), url: "", title: "", format: "auto" }] })}><T>Add video</T></Button>
    <p className="text-sm text-white/50"><T>Use Save all settings below to publish your changes.</T></p>
  </section>;
}
