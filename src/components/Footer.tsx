"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Music2, Cloud, Send, Mail } from "lucide-react";
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

  const activeSocials = (
    Object.entries(settings.social) as [
      keyof typeof settings.social,
      { url: string; enabled: boolean },
    ][]
  ).filter(([, s]) => s.enabled && s.url);

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size={40} className="text-black" />
            <p className="mt-4 text-sm leading-relaxed text-black/50">
              {settings.content.hero.tagline}. {settings.content.footer.tagline}
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/40">
              Navigation
            </h3>
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
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/40">
              Contact
            </h3>
            {settings.contact.show_email && settings.contact.email && (
              <a
                href={`mailto:${settings.contact.email}`}
                className="mt-4 flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
                {...hoverProps}
              >
                <Mail size={16} />
                {settings.contact.email}
              </a>
            )}
            <p className="mt-4 text-sm text-black/40">
              {settings.content.footer.contact_text}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-black/5 pt-8 text-xs text-black/40 md:flex-row">
          <p>{settings.content.footer.copyright}</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-black" {...hoverProps}>
              About
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-black" {...hoverProps}>
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-black" {...hoverProps}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
