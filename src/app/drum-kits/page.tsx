import { getDrumKits, getSiteSettings } from "@/lib/queries";
import { SectionHeader } from "@/components/SectionHeader";
import { DrumKitCard } from "@/components/DrumKitCard";

export const metadata = {
  title: "Drum Kits — WUTSHY",
};

export default async function DrumKitsPage() {
  const [kits, settings] = await Promise.all([
    getDrumKits(),
    getSiteSettings(),
  ]);

  return (
    <section className="py-16 pb-28 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          title={settings.content.pages.drum_kits.title}
          subtitle={settings.content.pages.drum_kits.subtitle}
        />
        {kits.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kits.map((kit, i) => (
              <DrumKitCard key={kit.id} kit={kit} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-black/40">No drum kits yet. Check back soon.</p>
        )}
      </div>
    </section>
  );
}
