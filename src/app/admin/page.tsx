"use client";


import { T } from "@/components/LocaleProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_WORKS, DEMO_DRUM_KITS } from "@/lib/data";
import { Music, Disc3, Star, Plus, ArrowUpRight, FileText, Settings, Code2 } from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    works: 0,
    drumKits: 0,
    featured: 0,
  });
  const { hoverProps } = useHoverSound(0.05);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setStats({
          works: DEMO_WORKS.length,
          drumKits: DEMO_DRUM_KITS.length,
          featured: DEMO_WORKS.filter((w) => w.is_featured).length,
        });
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const [worksRes, kitsRes] = await Promise.all([
        supabase.from("works").select("id, is_featured"),
        supabase.from("drum_kits").select("id"),
      ]);
      if (worksRes.error || kitsRes.error) {
        setError("Не удалось загрузить статистику. Проверьте подключение и обновите страницу.");
        setLoading(false);
        return;
      }

      setStats({
        works: worksRes.data?.length || 0,
        drumKits: kitsRes.data?.length || 0,
        featured: worksRes.data?.filter((w) => w.is_featured).length || 0,
      });
      setLoading(false);
    }
    load().catch(() => { setError("Не удалось подключиться к базе данных. Обновите страницу."); setLoading(false); });
  }, []);

  const cards = [
    {
      label: "Total Works",
      value: stats.works,
      icon: Music,
      href: "/admin/works",
    },
    {
      label: "Drum Kits",
      value: stats.drumKits,
      icon: Disc3,
      href: "/admin/drum-kits",
    },
    {
      label: "Featured",
      value: stats.featured,
      icon: Star,
      href: "/admin/works",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5"><span className="text-[10px] font-medium uppercase tracking-[.2em] text-white/45"><T>Workspace / Overview</T></span><Link href="/" className="inline-flex items-center gap-2 text-xs text-white/65 hover:text-white"><T>View website </T><ArrowUpRight size={14} /></Link></div>
      <h1 className="text-4xl font-semibold tracking-tight"><T>Your creative space.</T></h1>
      <p className="mt-1 text-sm text-white/40"><T>
        Welcome back, WUTSHY. Manage your portfolio from here.
      </T></p>
      {!isSupabaseConfigured() && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/5 px-5 py-4 text-xs leading-6 text-amber-100/75"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" /><T>Preview mode — показаны демоданные. Для сохранения изменений подключите Supabase.</T></div>}
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-400/10 p-4 text-sm text-red-200"><T>{error}</T></p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-white/10 bg-white/[.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#d9f99d]/30 hover:bg-white/[.07]"
            {...hoverProps}
          >
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-[#d9f99d]" />
              <ArrowUpRight size={16} className="text-white/25 group-hover:text-white" />
            </div>
            <p className="mt-8 text-4xl font-semibold tracking-tight">{loading || error ? "—" : value}</p>
            <p className="mt-2 text-sm text-white/50"><T>{label}</T></p>
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {[{ href: "/admin/content", icon: FileText, title: "Make it yours", text: "Тексты главной страницы, разделов и контактов." }, { href: "/admin/settings", icon: Settings, title: "Fine-tune your site", text: "Социальные сети, оплата и настройки портфолио." }, { href: "/connect", icon: Code2, title: "The other side", text: "Посмотреть IT-портфолио и страницу проектов." }].map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="rounded-2xl border border-white/10 p-6 transition-colors hover:bg-white/5"><Icon size={20} className="mb-5 text-violet-300" /><h2 className="text-sm font-semibold"><T>{title}</T></h2><p className="mt-2 text-xs leading-6 text-white/45"><T>{text}</T></p></Link>)}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold"><T>Quick Actions</T></h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/works?new=beat"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black"
            {...hoverProps}
          >
            <Plus size={16} /><T> Add Beat
          </T></Link>
          <Link
            href="/admin/works?new=mixing"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm"
            {...hoverProps}
          >
            <Plus size={16} /><T> Add Mix
          </T></Link>
          <Link
            href="/admin/drum-kits?new=true"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm"
            {...hoverProps}
          >
            <Plus size={16} /><T> Add Drum Kit
          </T></Link>
        </div>
      </div>
    </div>
  );
}
