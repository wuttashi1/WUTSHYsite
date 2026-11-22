import Link from "next/link";
import { T } from "@/components/LocaleProvider";
export function BeatsTabs({ youtube = false }: { youtube?: boolean }) {
  return <nav aria-label="Beats" className="mb-8 flex gap-2 border-b border-black/10 pb-4">
    {[{ href: "/beats", title: "Beats", active: !youtube }, { href: "/beats/youtube", title: "YT Beats", active: youtube }].map(item => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${item.active ? "bg-black text-white" : "text-black/50 hover:bg-black/5"}`}><T>{item.title}</T></Link>)}
  </nav>;
}
