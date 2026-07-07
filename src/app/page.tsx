import Link from "next/link";
import { getFeaturedWorks, getWorks, getDrumKits, getSiteSettings } from "@/lib/queries";
import { SectionHeader } from "@/components/SectionHeader";
import { CategoryCard } from "@/components/CategoryCard";
import { WorkCard } from "@/components/WorkCard";
import { PlacementCard } from "@/components/PlacementCard";
import { DrumKitCard } from "@/components/DrumKitCard";
import { HeroSection } from "@/components/HeroSection";
import { TrendingCarousel } from "@/components/TrendingCarousel";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { Reveal } from "@/components/anim/Reveal";

export default async function HomePage() {
  const [featured, allBeats, drumKits, settings] = await Promise.all([
    getFeaturedWorks(),
    getWorks("beat"),
    getDrumKits(),
    getSiteSettings(),
  ]);

  const beats = featured.filter((w) => w.type === "beat");
  const placements = featured.filter((w) => w.type === "placement");
  const featuredKits = drumKits.filter((k) => k.is_featured).slice(0, 3);

  const heroItems = [
    ...featuredKits.map((k) => ({
      id: k.id,
      title: k.title,
      cover_url: k.cover_url,
      accent_color: "#a3e635",
    })),
    ...beats.map((b) => ({
      id: b.id,
      title: b.title,
      cover_url: b.cover_url,
      accent_color: b.accent_color,
    })),
  ].slice(0, 5);

  const trending = allBeats.slice(0, 8);

  return (
    <div className="pb-28">
      <HeroSection settings={settings} items={heroItems} />

      <div className="pb-8">
        <TrendingCarousel items={trending} />
      </div>

      {settings.featured_video.enabled && settings.featured_video.youtube_url && (
        <FeaturedVideo
          youtubeUrl={settings.featured_video.youtube_url}
          title={settings.featured_video.title}
          videoTitle={settings.featured_video.video_title}
          author={settings.featured_video.author}
          thumbnailUrl={settings.featured_video.thumbnail_url}
          subtitle={settings.content.home.featured_video_subtitle}
        />
      )}

      <section className="bg-[#111] py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              title={settings.content.home.browse.title}
              subtitle={settings.content.home.browse.subtitle}
              dark
            />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <CategoryCard
              title={settings.content.home.beats_card.title}
              description={settings.content.home.beats_card.description}
              href="/beats"
              imagePosition="left"
              index={0}
            />
            <CategoryCard
              title={settings.content.home.mixing_card.title}
              description={settings.content.home.mixing_card.description}
              href="/mixing"
              imagePosition="right"
              index={1}
            />
            <CategoryCard
              title={settings.content.home.drum_kits_card.title}
              description={settings.content.home.drum_kits_card.description}
              href="/drum-kits"
              imagePosition="left"
              index={2}
            />
            <CategoryCard
              title={settings.content.home.placements_card.title}
              description={settings.content.home.placements_card.description}
              href="/beats#placements"
              imagePosition="right"
              index={3}
            />
          </div>
        </div>
      </section>

      {beats.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal>
              <SectionHeader
                title={settings.content.home.featured_beats.title}
                subtitle={settings.content.home.featured_beats.subtitle}
              />
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beats.map((work, i) => (
                <WorkCard key={work.id} work={work} index={i} queue={beats} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/beats"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-black hover:text-white"
              >
                {settings.content.home.featured_beats.cta}
              </Link>
            </div>
          </div>
        </section>
      )}

      {featuredKits.length > 0 && (
        <section className="bg-[#fafafa] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal>
              <SectionHeader
                title={settings.content.home.shop_drums.title}
                subtitle={settings.content.home.shop_drums.subtitle}
              />
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredKits.map((kit, i) => (
                <DrumKitCard key={kit.id} kit={kit} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {placements.length > 0 && (
        <section id="placements" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal>
              <SectionHeader
                title={settings.content.home.placements.title}
                subtitle={settings.content.home.placements.subtitle}
              />
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {placements.map((work, i) => (
                <PlacementCard
                  key={work.id}
                  work={work}
                  index={i}
                  queue={placements}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
