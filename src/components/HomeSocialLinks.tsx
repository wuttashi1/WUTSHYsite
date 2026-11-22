import { Instagram, Send, AudioLines } from "lucide-react";
import { T } from "@/components/LocaleProvider";
import { safeContactUrl, type ContactProfile } from "@/lib/contact";

export function HomeSocialLinks({ contact }: { contact: ContactProfile }) {
  const links = [
    { label: "Beat loops", note: "Find your next sound", url: "https://drive.google.com/drive/folders/1WDtqaRMoV5xhze2nMHWpUD2I0dNl0LBf", icon: AudioLines, color: "bg-[#facc15] text-black" },
    { label: "Telegram", note: "Stay in touch", url: safeContactUrl(contact.telegram), icon: Send, color: "bg-[#e0f2fe] text-[#075985]" },
    { label: "Instagram", note: "Behind the music", url: safeContactUrl(contact.instagram), icon: Instagram, color: "bg-[#fce7f3] text-[#9d174d]" },
  ];
  return <nav aria-label="Social links" className="mx-auto grid max-w-7xl gap-3 px-4 pb-12 md:grid-cols-3 md:px-6">
    {links.filter(link => link.url).map(({ label, note, url, icon: Icon, color }) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" className={`group flex items-center gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transform-none ${color}`}>
      <span className="rounded-xl bg-white/50 p-3"><Icon size={25} /></span>
      <span><span className="block text-lg font-bold"><T>{label}</T></span><span className="text-sm opacity-70"><T>{note}</T></span></span>
    </a>)}
  </nav>;
}
