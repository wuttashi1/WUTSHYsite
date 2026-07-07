"use client";

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
} from "lucide-react";
import { useHoverSound } from "@/hooks/useHoverSound";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/works", label: "Works", icon: Music },
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-white/10 bg-[#111] text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Image
          src="/logo.png"
          alt="WUTSHY"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold">WUTSHY</p>
          <p className="text-[10px] text-white/40">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              pathname === href
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
            {...hoverProps}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
          {...hoverProps}
        >
          <ArrowLeft size={16} />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
          {...hoverProps}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
