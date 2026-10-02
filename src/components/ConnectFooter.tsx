"use client";
import { useState } from "react";
import { ArrowUpRight, Github, Send, MessageCircle, Copy } from "lucide-react";
import { T, useLocale } from "@/components/LocaleProvider";

export function ConnectFooter() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  async function copyDiscord() { try { await navigator.clipboard.writeText("wutshy"); setCopied(true); } catch { setCopied(false); } }
  return (
    <footer id="contact" className="scroll-mt-20 bg-[#111114] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-20">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[.22em] text-violet-300"><T>LET&apos;S CONNECT / IT & DEVELOPMENT</T></p>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-.045em] md:text-5xl"><T>Let&apos;s build something useful.</T></h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/45"><T>Have a role or a project in mind? Let&apos;s talk about development, automation and the details that make a product work.</T></p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <a href="https://github.com/wuttashi1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><Github size={16} /> GitHub / wuttashi1 <ArrowUpRight size={14} /></a>
            <a href="https://t.me/spirit_link" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><Send size={16} /> Telegram / @spirit_link <ArrowUpRight size={14} /></a>
            <div className="flex items-center gap-3"><a href="https://discord.com/channels/@me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><MessageCircle size={16} /> Discord / @wutshy <ArrowUpRight size={14} /></a><button onClick={copyDiscord} aria-label={t("Copy Discord username")} className="rounded-lg p-2 text-white/50 hover:bg-white/10"><Copy size={14} /></button></div>
            {copied && <p role="status" className="text-xs text-lime-200"><T>Username copied</T></p>}
          </div>
        </div>
        <div className="flex flex-col gap-8 pt-8 md:flex-row md:items-center md:justify-between">
          <div><span className="text-lg font-bold tracking-tight">WUTSHY</span><p className="mt-3 text-[11px] text-white/35">© 2026 WUTSHY · <T>Development portfolio</T></p></div>
        </div>
      </div>
    </footer>
  );
}
