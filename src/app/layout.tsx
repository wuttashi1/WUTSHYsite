import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlayerProvider } from "@/context/PlayerContext";
import { PlayerBar } from "@/components/player/PlayerBar";
import { getSiteSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import { validLocale, contentDictionary, locales } from "@/lib/i18n";
import { LocaleProvider } from "@/components/LocaleProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WUTSHY — Producer & Mix Engineer",
  description:
    "Portfolio of WUTSHY — beats, mixing, drum kits. Explore my work and sounds.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const locale = validLocale((await cookies()).get("wutshy-locale")?.value);
  const overrides = Object.fromEntries(locales.map(language => [language, contentDictionary(settings.content, settings.content_locales?.[language])]));

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <LocaleProvider initialLocale={locale} overrides={overrides}><PlayerProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <PlayerBar />
        </PlayerProvider></LocaleProvider>
      </body>
    </html>
  );
}
