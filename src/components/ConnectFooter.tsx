"use client";
import { useState } from "react";
import { ArrowUpRight, Github, Send, MessageCircle, Copy, Instagram, Mail } from "lucide-react";
import { T, useLocale } from "@/components/LocaleProvider";
import { ContactForm } from "@/components/ContactForm";
import type { ContactProfile } from "@/lib/contact";
export function ConnectFooter({ profile }: { profile: ContactProfile }) {
  const { t } = useLocale(); const [copied, setCopied] = useState(false);
  async function copyDiscord() { try { await navigator.clipboard.writeText(profile.discord); setCopied(true); } catch { setCopied(false); } }
  const links = [{ url: profile.github, label: "GitHub", Icon: Github }, { url: profile.telegram, label: "Telegram", Icon: Send }, { url: profile.instagram, label: "Instagram", Icon: Instagram }];
  return <footer id="contact" className="scroll-mt-20 bg-[#111114] text-white">
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-20">
      <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-300"><T>LET&apos;S CONNECT / IT & DEVELOPMENT</T></p><h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-.045em] md:text-5xl"><T>Let&apos;s build something useful.</T></h2><p className="mt-5 max-w-md text-sm leading-7 text-white/45"><T>Have a role or a project in mind? Let&apos;s talk about development, automation and the details that make a product work.</T></p></div>
        <div className="min-w-0"><div className="flex flex-wrap gap-x-6 gap-y-4">{links.filter(link => link.url).map(({ url, label, Icon }) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-white"><Icon size={16} />{label}<ArrowUpRight size={14} /></a>)}</div>
          {profile.discord && <div className="mt-4 flex items-center gap-3"><a href="https://discord.com/channels/@me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/65"><MessageCircle size={16} />Discord / @{profile.discord.replace(/^@/, "")}</a><button onClick={copyDiscord} aria-label={t("Copy Discord username")} className="rounded-lg p-2 hover:bg-white/10"><Copy size={14} /></button></div>}
          {copied && <p role="status" className="text-xs text-lime-200"><T>Username copied</T></p>}
          {profile.show_email && profile.email && <a href={`mailto:${profile.email}`} className="mt-4 flex items-center gap-2 break-all text-sm text-white/65 hover:text-white"><Mail size={16} className="shrink-0" />{profile.email}</a>}
          <ContactForm area="it" profile={profile} dark />
        </div>
      </div><div className="pt-8"><span className="text-lg font-bold tracking-tight">WUTSHY</span><p className="mt-3 text-[11px] text-white/35">© 2026 WUTSHY · <T>Development portfolio</T></p></div>
    </div>
  </footer>;
}
