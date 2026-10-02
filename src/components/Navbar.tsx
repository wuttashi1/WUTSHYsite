"use client";


import { T, LocalizedInput } from "@/components/LocaleProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { useHoverSound } from "@/hooks/useHoverSound";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LocaleProvider";

const links = [
  { href: "/beats", label: "Beats" },
  { href: "/mixing", label: "Mixing", badge: null },
  { href: "/drum-kits", label: "Drum Kits", badge: "NEW" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { hoverProps } = useHoverSound();

  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/connect") return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111]/95 text-white backdrop-blur-xl">
      <nav aria-label="Portfolio" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Logo href="/connect" size={36} className="text-white" />
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="#projects" className="hidden text-xs text-white/60 hover:text-white sm:block"><T>Projects</T></a>
          <a href="#contact" className="text-xs text-white/70 hover:text-white"><T>Contact</T></a>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111]/95 text-white shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div {...hoverProps}>
          <Logo size={36} className="text-white" />
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm transition-colors hover:text-white/80 ${
                pathname === link.href ? "text-white" : "text-white/60"
              }`}
              {...hoverProps}
            >
              <T>{link.label}</T>
              {link.badge && (
                <span className="ml-1.5 rounded-full bg-[#4ade80] px-1.5 py-0.5 text-[10px] font-bold text-black">
                  <T>{link.badge}</T>
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition-colors focus-within:bg-white/15"
          >
            <button type="submit" aria-label="Search" {...hoverProps}>
              <Search size={14} className="text-white/50" />
            </button>
            <LocalizedInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search beats, kits..."
              className="w-40 bg-transparent text-white placeholder:text-white/50 outline-none"
            />
          </form>
        </div>

        <LanguageSwitcher />
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              <form
                onSubmit={handleSearch}
                className="mb-2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm"
              >
                <button type="submit" aria-label="Search">
                  <Search size={14} className="text-white/50" />
                </button>
                <LocalizedInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="search beats, kits..."
                  className="w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                />
              </form>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                  {...hoverProps}
                >
                  <T>{link.label}</T>
                  {link.badge && (
                    <span className="ml-1.5 rounded-full bg-[#4ade80] px-1.5 py-0.5 text-[10px] font-bold text-black">
                      <T>{link.badge}</T>
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
