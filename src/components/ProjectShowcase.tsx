"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, RotateCcw, Send, CheckCheck, ChevronRight, Volume2, MicOff } from "lucide-react";
import { showcase, demoFlows, type DemoId } from "@/lib/showcase";
import { T, useLocale } from "./LocaleProvider";

type Message = { text: string; user?: boolean };
function ChatDemo({ id }: { id: Exclude<DemoId, "spatial"> }) {
  const project = showcase.find(project => project.id === id)!;
  const flow = demoFlows[id];
  const [messages, setMessages] = useState<Message[]>([{ text: flow.welcome }]);
  const [pending, setPending] = useState(false);
  const [muted, setMuted] = useState(false);
  const [sets, setSets] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const discord = project.platform === "Discord";
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, pending]);
  function reset() { if (timer.current) clearTimeout(timer.current); setPending(false); setMessages([{ text: flow.welcome }]); setSets(0); setMuted(false); setAdded(false); }
  function act(index: number) {
    if (pending) return;
    const action = flow.actions[index];
    setMessages(previous => [...previous.slice(-15), { text: action.label, user: true }]);
    setPending(true);
    timer.current = setTimeout(() => {
      setMessages(previous => [...previous, { text: action.reply }]);
      setPending(false);
      if (id === "voice") setMuted(index === 0);
      if (id === "fitness" && index === 1) setSets(count => count + 1);
      if (id === "anime" && index === 1) setAdded(true);
    }, 650);
  }
  return <div className={`chat-demo ${discord ? "chat-discord" : ""}`}>
    <div className="flex items-center gap-3 border-b border-black/5 bg-white px-5 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg" style={{ background: project.color }}>{project.icon}</span>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{project.title}</p><p className="mt-0.5 text-[10px] text-black/45">{project.platform} · <T>interactive preview</T></p></div>
      <button onClick={reset} aria-label={t("Restart demo")} title={t("Restart demo")} className="rounded-full p-2 text-black/45 transition-colors hover:bg-black/5"><RotateCcw size={16} /></button>
    </div>
    {id === "voice" && <div className="flex gap-3 bg-[#292b33] px-5 py-2 text-[10px] text-white/70">{muted ? <MicOff size={14} /> : <Volume2 size={14} />} Studio · WUTSHY, Alex, Sam</div>}
    <div ref={log} role="log" aria-live="polite" aria-label={t("Demo conversation")} className="chat-log h-[340px] overflow-y-auto p-4 sm:p-5">
      {messages.map((message, index) => <div key={index} className={`chat-bubble ${message.user ? "chat-outgoing" : ""}`}><p className="whitespace-pre-line text-[13px] leading-6">{t(message.text)}</p><div aria-hidden="true" className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-40">12:{String(index).padStart(2, "0")} {message.user && <CheckCheck size={12} />}</div></div>)}
      {pending && <div className="chat-bubble w-fit text-xs" role="status">{t("typing…")}</div>}
    </div>
    <div className="border-t border-black/5 bg-white p-3">
      <div className="grid gap-1.5">{flow.actions.map((action, index) => <button key={action.label} disabled={pending} onClick={() => act(index)} className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#edf4fa] px-3 py-2 text-xs font-medium text-[#367dab] transition-colors hover:bg-[#dcecf8] disabled:opacity-40">{t(action.label)}{id === "fitness" && index === 1 && sets > 0 ? ` · ${sets}` : ""}{id === "anime" && index === 1 && added ? " ✓" : ""}</button>)}</div>
      <p className="mt-3 flex items-center justify-center gap-2 text-center text-[10px] leading-4 text-black/40"><Send size={11} /><T>Choose a button to try the bot. No login needed.</T></p>
    </div>
  </div>;
}

function SpatialDemo() {
  const [open, setOpen] = useState(true);
  const [equipment, setEquipment] = useState(false);
  const [holo, setHolo] = useState(true);
  const [items, setItems] = useState(["⛏", "◆", "▣", "●", "", "", "", "", "", "", "", ""]);
  const [selected, setSelected] = useState<number | null>(null);
  const { t } = useLocale();
  return <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141d22] text-white shadow-xl">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="text-sm font-semibold">Spatial HandGUI</span><span className="text-[10px] text-white/40"><T>Interactive concept</T></span></div>
    <div className="spatial-scene relative flex h-[340px] items-center justify-center overflow-hidden p-5">
      <div className="spatial-mountain" aria-hidden="true" />
      {open && <div className={`relative z-10 w-64 rotate-[-5deg] rounded-xl border p-4 shadow-2xl transition-colors ${holo ? "border-cyan-200/30 bg-[#112b35]/90" : "border-stone-300 bg-stone-600"}`}><p className="mb-3 text-[10px] uppercase tracking-widest"><T>Inventory</T></p><div className="grid grid-cols-4 gap-1.5">{items.map((item, index) => <button key={index} aria-label={`${t("Slot")} ${index + 1}${item ? `: ${item}` : ""}`} aria-pressed={selected === index} onClick={() => { if (selected === null) { if (items[index]) setSelected(index); } else { setItems(previous => { const next = [...previous]; [next[selected], next[index]] = [next[index], next[selected]]; return next; }); setSelected(null); } }} className={`flex aspect-square items-center justify-center rounded border text-xl ${selected === index ? "border-lime-200 bg-lime-200/20" : "border-white/15 bg-white/5 hover:bg-white/15"}`}>{item}</button>)}</div>{equipment && <div className="mt-3 rounded border border-white/20 p-3 text-xs"><T>Equipment & crafting</T><div className="mt-2 flex gap-3 text-xl">♜ ◇ ▦</div></div>}</div>}
      {!open && <p className="relative z-10 text-sm"><T>Inventory closed</T></p>}
    </div>
    <div className="space-y-2 border-t border-white/10 p-4">{[{ text: open ? "Close inventory" : "Open inventory", action: () => { setOpen(!open); setSelected(null); } }, { text: "Equipment panel", action: () => { setOpen(true); setEquipment(!equipment); } }, { text: holo ? "Vanilla style" : "Holographic style", action: () => setHolo(!holo) }].map(button => <button key={button.text} onClick={button.action} className="block w-full rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20">{t(button.text)}</button>)}<p className="pt-1 text-center text-[10px] leading-5 text-white/45"><T>Select an item, then a slot to move it. Stylized web demo, not the game.</T></p></div>
  </div>;
}

export function ProjectShowcase() {
  const [active, setActive] = useState<DemoId>("food");
  const [mode, setMode] = useState<"screenshots" | "demo">("screenshots");
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const { t } = useLocale();
  const project = showcase.find(project => project.id === active)!;
  const shot = project.screenshots?.[screenshotIndex];
  return <div>
    <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label={t("Projects")}>{showcase.map((item, index) => <button key={item.id} role="tab" tabIndex={item.id === active ? 0 : -1} onKeyDown={event => { const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0; if (!delta) return; event.preventDefault(); const next = showcase[(index + delta + showcase.length) % showcase.length]; setActive(next.id); setScreenshotIndex(0); setMode("screenshots"); document.getElementById(`tab-${next.id}`)?.focus(); }} aria-selected={item.id === active} aria-controls="project-preview" id={`tab-${item.id}`} onClick={() => { setActive(item.id); setScreenshotIndex(0); setMode("screenshots"); }} className={`rounded-2xl border p-4 text-left transition-all ${item.id === active ? "border-black bg-black text-white shadow-lg" : "border-black/8 bg-white hover:-translate-y-1 hover:border-black/20"}`}><span className="mb-4 block text-xl">{item.icon}</span><span className="block text-xs font-semibold">{item.title}</span><span className={`mt-1 block text-[9px] ${item.id === active ? "text-white/45" : "text-black/40"}`}>{item.platform}</span></button>)}</div>
    <div id="project-preview" role="tabpanel" aria-labelledby={`tab-${active}`} className="grid items-center gap-10 rounded-[2rem] border border-black/8 bg-white p-5 sm:p-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:p-12">
      <div><p className="eyebrow">{project.platform} / <T>PROJECT PREVIEW</T></p><h3 className="mt-5 text-4xl font-bold tracking-[-.04em] sm:text-5xl">{project.title}</h3><p className="mt-5 max-w-md text-base leading-7 text-black/55"><T>{project.description}</T></p><div className="mt-6 flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="rounded-full bg-black/5 px-3 py-1.5 text-[11px] text-black/55">{tag}</span>)}</div><a href={`https://github.com/wuttashi1/${project.repo}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-medium"><T>View project</T><ArrowUpRight size={16} /></a><div className="mt-10 max-w-sm rounded-2xl bg-[#f7f7fa] p-5"><p className="flex items-center gap-2 text-xs font-semibold"><ChevronRight size={14} /><T>Try it right here</T></p><p className="mt-2 text-xs leading-6 text-black/45"><T>This is a scripted preview with sample data. Actions stay in your browser; no messages are sent to Telegram or Discord.</T></p></div></div>
      <div className="mx-auto w-full min-w-0 max-w-xl">
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="portfolio-button mb-5 w-full bg-[#229ed9] text-white"><Send size={15} /><T>Open the real bot</T><ArrowUpRight size={15} /></a>}
        {project.screenshots?.length ? <div className="mb-4 flex gap-2"><button onClick={() => setMode("screenshots")} aria-pressed={mode === "screenshots"} className={`rounded-full px-4 py-2 text-xs ${mode === "screenshots" ? "bg-black text-white" : "bg-black/5"}`}><T>Real screenshots</T></button><button onClick={() => setMode("demo")} aria-pressed={mode === "demo"} className={`rounded-full px-4 py-2 text-xs ${mode === "demo" ? "bg-black text-white" : "bg-black/5"}`}><T>Interactive demo</T></button></div> : null}
        {shot && mode === "screenshots" ? <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#151518]">
          <a href={shot.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3]" aria-label={`${t("Open screenshot")}: ${shot.caption}`}><Image src={shot.url} alt={shot.caption} fill sizes="(max-width: 1024px) 90vw, 550px" className="object-contain" /></a>
          <div className="border-t border-white/10 p-4"><p className="text-[10px] text-white/50"><T>Original screenshot from the project repository</T></p><div className="mt-3 flex flex-wrap gap-2">{project.screenshots?.map((image, index) => <button key={image.url} onClick={() => setScreenshotIndex(index)} aria-pressed={index === screenshotIndex} className={`rounded-lg px-3 py-2 text-[10px] ${index === screenshotIndex ? "bg-lime-200 text-black" : "bg-white/10 text-white/65"}`}>{image.caption}</button>)}</div></div>
        </div> : active === "spatial" ? <SpatialDemo key={active} /> : <ChatDemo key={active} id={active} />}
      </div>
    </div>
  </div>;
}
