"use client";


import { T } from "@/components/LocaleProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Music,
  Disc3,
  Settings,
  LogOut,
  ArrowLeft,
  FileText,
  ListMusic,
} from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/LocaleProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/works", label: "Works", icon: Music },
  { href: "/admin/collections", label: "Artist selections", icon: ListMusic },
  { href: "/admin/drum-kits", label: "Drum Kits", icon: Disc3 },
  { href: "/admin/content", label: "Site Texts", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { hoverProps } = useHoverSound(0.05);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") return null;

  return (
    <aside className="z-40 flex w-full flex-col border-r border-white/10 bg-[#111114] text-white md:fixed md:left-0 md:top-0 md:h-screen md:w-60">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Image
          src="/logo.png"
          alt="WUTSHY"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold"><T>WUTSHY</T></p>
          <p className="text-[10px] uppercase tracking-[.2em] text-white/40"><T>Studio / Admin</T></p>
        </div>
      </div>

      <div className="px-5 pt-3"><LanguageSwitcher /></div>
      <nav aria-label="Administration" className="scrollbar-hide flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors ${
              pathname === href
                ? "bg-[#d9f99d] font-medium text-black"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
            {...hoverProps}
          >
            <Icon size={16} />
            <T>{label}</T>
          </Link>
        ))}
      </nav>

      <div className="flex border-t border-white/10 p-3 md:block md:space-y-1">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
          {...hoverProps}
        >
          <ArrowLeft size={16} /><T>
          Back to site
        </T></Link>
        <button
          onClick={handleLogout}
          className="flex w-auto items-center gap-3 rounded-xl md:w-full px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
          {...hoverProps}
        >
          <LogOut size={16} /><T>
          Logout
        </T></button>
      </div>
    </aside>
  );
}
