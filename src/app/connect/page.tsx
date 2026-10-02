
import { T } from "@/components/LocaleProvider";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Github, Code2, Layers3, AudioLines } from "lucide-react";
import { Reveal } from "@/components/anim/Reveal";
import { BackgroundBlobs } from "@/components/anim/BackgroundBlobs";
import { projects } from "@/lib/projects";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { showcase } from "@/lib/showcase";

export const metadata: Metadata = {
  title: "WUTSHY — IT Portfolio",
  description: "WUTSHY — software development portfolio. Web applications, Telegram and Discord bots, automation and Java projects.",
};

export default function ConnectPage() {
  return (
    <div className="connect-page">
      <section className="relative isolate overflow-hidden border-b border-black/5">
        <BackgroundBlobs />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:items-center md:px-6 md:py-28">
          <Reveal>
            <p className="eyebrow"><span className="h-2 w-2 rounded-full bg-violet-500" /><T> WUTSHY / IT PORTFOLIO</T></p>
            <h1 className="mt-7 text-6xl font-bold leading-[.98] tracking-[-.06em] sm:text-7xl lg:text-8xl"><T>Ideas.</T><br /><T>Code.</T><br /><span className="text-gradient"><T>Connection.</T></span></h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-black/55"><T>I build web applications, bots and tools that solve everyday problems. Explore the code, try the demos and see the products in action.</T></p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="portfolio-button bg-black text-white"><T>Смотреть проекты </T><ArrowDown size={16} /></a>
              <a href="https://github.com/wuttashi1" target="_blank" rel="noopener noreferrer" className="portfolio-button border border-black/15"><Github size={17} /><T> GitHub </T><ArrowUpRight size={15} /></a>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="relative py-8">
            <div className="code-art" aria-hidden="true">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4"><div className="flex gap-1.5"><i /><i /><i /></div><span className="font-mono text-[10px] tracking-widest text-white/40"><T>WUTSHY / CONNECT</T></span></div>
              <div className="px-7 py-10 sm:px-10">
                <span className="font-mono text-xs text-white/35"><T>01 — CREATIVE DEVELOPMENT</T></span>
                <div className="my-8 text-7xl font-semibold tracking-tighter text-[#c4b5fd] sm:text-8xl"><T>&lt;w /&gt;</T></div>
                <div className="space-y-2 font-mono text-xs leading-6 sm:text-sm"><p><span className="text-violet-300"><T>const</T></span><T> wutshy = &#123;</T></p><p className="pl-5 text-white/55">focus: <span className="text-lime-200">&quot;useful products&quot;</span>,</p><p className="pl-5 text-white/55"><T>code: </T><span className="text-cyan-200">&quot;with purpose&quot;</span></p><p>&#125;;<span className="code-caret">▍</span></p></div>
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 px-6 py-4 font-mono text-[10px] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /><T> SOFTWARE × AUTOMATION</T></div>
            </div>
            <span className="absolute -bottom-1 right-3 rounded-2xl border border-black/5 bg-[#d9f99d] px-5 py-3 text-xs font-semibold shadow-lg"><T>Built with curiosity ↗</T></span>
          </Reveal>
        </div>
      </section>
      <section id="projects" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-6">
        <Reveal className="mb-9 flex items-end justify-between gap-4"><div><p className="eyebrow"><T>01 / SELECTED WORK</T></p><h2 className="mt-3 text-4xl font-bold tracking-tight"><T>Из идеи в проект.</T></h2></div><span className="font-mono text-sm text-black/35">/{String(projects.length + showcase.length).padStart(2, "0")}</span></Reveal>
        <ProjectShowcase />
        <div className="mt-12" />
        {projects.map((project, index) => (
          <Reveal key={project.url}>
            <article className="project-card grid overflow-hidden rounded-[2rem] border border-black/10 bg-white md:grid-cols-2">
              <a href={project.url} className="project-art group relative flex min-h-80 items-center justify-center overflow-hidden p-8" aria-label={`Открыть ${project.title}`}>
                <div className="absolute left-6 top-6 font-mono text-xs text-black/45"><T>{String(index + 1).padStart(2, "0")}</T><T> / WEB EXPERIENCE</T></div>
                <div className="project-disc"><AudioLines size={62} strokeWidth={1} /></div>
                <span className="absolute bottom-6 left-6 text-3xl font-black tracking-tighter"><T>{project.title}</T><span className="text-black/30">®</span></span>
                <ArrowUpRight className="absolute bottom-7 right-7 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
              <div className="flex flex-col items-start justify-center p-8 lg:p-12"><p className="eyebrow"><T>{project.category}</T></p><h3 className="mt-4 text-3xl font-bold tracking-tight"><T>{project.title}</T><T> — Web application</T></h3><p className="mt-4 max-w-md text-sm leading-7 text-black/55"><T>{project.description}</T></p><div className="mt-6 flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-black/60"><T>{tag}</T></span>)}</div><a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-semibold"><T>Исходный код </T><ArrowUpRight size={16} /></a></div>
            </article>
          </Reveal>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-6">
        <Reveal className="grid gap-5 sm:grid-cols-3">
          {[{ icon: Code2, title: "Разработка", text: "От структуры приложения до работающего интерфейса." }, { icon: Layers3, title: "Внимание к деталям", text: "Типографика, движение и понятное взаимодействие." }, { icon: AudioLines, title: "Practical tools", text: "Automation, integrations and clear user interfaces." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-black/8 p-7"><Icon size={24} strokeWidth={1.5} className="mb-6 text-violet-500" /><h3 className="font-semibold"><T>{title}</T></h3><p className="mt-2 text-sm leading-6 text-black/50"><T>{text}</T></p></div>)}
        </Reveal>
      </section>
      <div className="mx-auto max-w-7xl px-5 pb-10 md:px-6"><Link href="/" className="inline-flex items-center gap-2 text-[10px] tracking-widest text-black/35 hover:text-black">MUSIC PRODUCTION PORTFOLIO <ArrowUpRight size={13} /></Link></div>
    </div>
  );
}
