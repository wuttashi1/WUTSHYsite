import { getWorks, getSiteSettings } from "@/lib/queries";
import { SectionHeader } from "@/components/SectionHeader";
import { WorkCard } from "@/components/WorkCard";
import { PlacementCard } from "@/components/PlacementCard";
import { Reveal } from "@/components/anim/Reveal";

export const metadata = {
  title: "Beats — WUTSHY",
};

export default async function BeatsPage() {
  const [beats, placements, settings] = await Promise.all([
    getWorks("beat"),
    getWorks("placement"),
    getSiteSettings(),
  ]);

  return (
    <div className="pb-28">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <SectionHeader
              title={settings.content.pages.beats.title}
              subtitle={settings.content.pages.beats.subtitle}
            />
          </Reveal>
          {beats.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beats.map((work, i) => (
                <WorkCard key={work.id} work={work} index={i} queue={beats} />
              ))}
            </div>
          ) : (
            <p className="text-black/40">No beats yet. Check back soon.</p>
          )}
        </div>
      </section>

      {placements.length > 0 && (
        <section id="placements" className="bg-[#fafafa] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeader
              title={settings.content.pages.placements.title}
              subtitle={settings.content.pages.placements.subtitle}
            />
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
