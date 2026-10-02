"use client";


import { T } from "@/components/LocaleProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Music2, Cloud, Send, Mail, ArrowUpRight } from "lucide-react";
import { ConnectFooter } from "@/components/ConnectFooter";
import { useHoverSound } from "@/hooks/useHoverSound";
import { SiteSettings } from "@/types";
import { Logo } from "@/components/Logo";

const socialIcons = {
  instagram: Instagram,
  spotify: Music2,
  soundcloud: Cloud,
  telegram: Send,
} as const;

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const pathname = usePathname();
  const { hoverProps } = useHoverSound(0.05);

  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/connect") return <ConnectFooter />;

  const activeSocials = (
    Object.entries(settings.social) as [
      keyof typeof settings.social,
      { url: string; enabled: boolean },
    ][]
  ).filter(([, s]) => s.enabled && s.url);

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <a href="/connect" className="portfolio-switch group mb-12 flex flex-col gap-6 rounded-3xl bg-[#111] p-7 text-white sm:flex-row sm:items-center sm:justify-between md:p-10">
          <div><p className="mb-3 text-xs tracking-[.18em] text-white/45"><T>THE OTHER SIDE / CODE</T></p><span className="text-xl font-semibold tracking-tight sm:text-3xl">IT PORTFOLIO</span></div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9f99d] text-black transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={24} /></span>
        </a>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size={40} className="text-black" />
            <p className="mt-4 text-sm leading-relaxed text-black/50">
              <T>{settings.content.hero.tagline}</T>. <T>{settings.content.footer.tagline}</T>
            </p>
            {activeSocials.length > 0 && (
              <div className="mt-5 flex gap-2">
                {activeSocials.map(([key, social]) => {
                  const Icon = socialIcons[key];
                  return (
                    <a
                      key={key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
                      aria-label={key}
                      {...hoverProps}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/40"><T>
              Navigation
            </T></h3>
            <nav className="mt-4 flex flex-col gap-2">
              {[
                { href: "/beats", label: "Beats" },
                { href: "/mixing", label: "Mixing" },
                { href: "/drum-kits", label: "Drum Kits" },
                { href: "/about", label: "About" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-black/60 transition-colors hover:text-black"
                  {...hoverProps}
                >
                  <T>{link.label}</T>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/40"><T>
              Contact
            </T></h3>
            {settings.contact.show_email && settings.contact.email && (
              <a
                href={`mailto:${settings.contact.email}`}
                className="mt-4 flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
                {...hoverProps}
              >
                <Mail size={16} />
                <T>{settings.contact.email}</T>
              </a>
            )}
            <p className="mt-4 text-sm text-black/40">
              <T>{settings.content.footer.contact_text}</T>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-black/5 pt-8 text-xs text-black/40 md:flex-row">
          <p><T>{settings.content.footer.copyright}</T></p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-black" {...hoverProps}><T>
              About
            </T></Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-black" {...hoverProps}><T>
              Privacy Policy
            </T></Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-black" {...hoverProps}><T>
              Terms of Service
            </T></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
