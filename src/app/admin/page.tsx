"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_WORKS, DEMO_DRUM_KITS } from "@/lib/data";
import { Music, Disc3, Star, Plus } from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";

export default function AdminDashboard() {
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
        return;
      }

      const supabase = createClient();
      const [worksRes, kitsRes] = await Promise.all([
        supabase.from("works").select("id, is_featured"),
        supabase.from("drum_kits").select("id"),
      ]);

      setStats({
        works: worksRes.data?.length || 0,
        drumKits: kitsRes.data?.length || 0,
        featured: worksRes.data?.filter((w) => w.is_featured).length || 0,
      });
    }
    load();
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
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-white/40">
        Welcome back, WUTSHY. Manage your portfolio from here.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
            {...hoverProps}
          >
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-white/40" />
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="mt-2 text-sm text-white/50">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/works?new=beat"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black"
            {...hoverProps}
          >
            <Plus size={16} /> Add Beat
          </Link>
          <Link
            href="/admin/works?new=mixing"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm"
            {...hoverProps}
          >
            <Plus size={16} /> Add Mix
          </Link>
          <Link
            href="/admin/drum-kits?new=true"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm"
            {...hoverProps}
          >
            <Plus size={16} /> Add Drum Kit
          </Link>
        </div>
      </div>
    </div>
  );
}
