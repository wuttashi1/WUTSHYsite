import { Instagram, Send, AudioLines } from "lucide-react";
import { T } from "@/components/LocaleProvider";
import { safeContactUrl, type ContactProfile } from "@/lib/contact";

export function HomeSocialLinks({ contact }: { contact: ContactProfile }) {
  const links = [
    { label: "Beat loops", note: "Find your next sound", url: "https://drive.google.com/drive/folders/1WDtqaRMoV5xhze2nMHWpUD2I0dNl0LBf", icon: AudioLines, color: "bg-[#111] text-white" },
    { label: "Telegram", note: "Stay in touch", url: safeContactUrl(contact.telegram), icon: Send, color: "border border-black/10 bg-white text-black" },
    { label: "Instagram", note: "Behind the music", url: safeContactUrl(contact.instagram), icon: Instagram, color: "border border-black/10 bg-white text-black" },
  ];
  return <nav aria-label="Social links" className="flex flex-wrap gap-2.5">
    {links.filter(link => link.url).map(({ label, url, icon: Icon, color }) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 ${color}`}>
      <Icon size={16} aria-hidden="true" />
      <T>{label}</T>
    </a>)}
  </nav>;
}
