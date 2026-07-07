import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PlayerProvider } from "@/context/PlayerContext";
import { PlayerBar } from "@/components/player/PlayerBar";
import { getSiteSettings } from "@/lib/settings";

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

  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <PlayerProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
