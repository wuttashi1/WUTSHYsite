import { BeatsTabs } from "@/components/BeatsTabs";
import { SectionHeader } from "@/components/SectionHeader";
import { YoutubeBeats } from "@/components/YoutubeBeats";
import { T } from "@/components/LocaleProvider";
import { BEATS_CHANNEL_URL } from "@/lib/youtube-catalog";
import { refreshYoutube } from "@/lib/youtube-server";
export const metadata = { title: "YT Beats — WUTSHY" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export default async function Page() {
  const catalog = await refreshYoutube().catch(() => ({ configured: false, stale: true, channel: "WUTSHY BEATS II", videos: [] }));
  return <section className="mx-auto max-w-7xl px-4 py-16 pb-28 md:px-6 md:pt-24"><BeatsTabs youtube /><SectionHeader title="YT Beats" subtitle={catalog.channel} />
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-black/50"><T>Beats from my YouTube channel</T></p><a href={BEATS_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-black/10 px-5 py-2.5 text-sm hover:bg-black hover:text-white"><T>Open channel</T></a></div>
    {catalog.configured ? <><YoutubeBeats videos={catalog.videos} />{catalog.stale && <p className="mt-6 text-sm text-black/40"><T>Showing the last available videos. New uploads will appear after the next successful update.</T></p>}</> : <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-8"><p className="text-black/60"><T>The video collection is being connected. You can watch all beats on my YouTube channel.</T></p><a className="mt-5 inline-block rounded-full bg-black px-6 py-3 text-sm text-white" href={BEATS_CHANNEL_URL} target="_blank" rel="noopener noreferrer"><T>Watch on YouTube</T></a></div>}
  </section>;
}
