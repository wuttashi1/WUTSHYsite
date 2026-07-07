import { getWorks, getSiteSettings } from "@/lib/queries";
import { SectionHeader } from "@/components/SectionHeader";
import { MixBeforeAfter } from "@/components/MixBeforeAfter";

export const metadata = {
  title: "Mixing — WUTSHY",
};

export default async function MixingPage() {
  const [works, settings] = await Promise.all([
    getWorks("mixing"),
    getSiteSettings(),
  ]);

  return (
    <section className="py-16 pb-28 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          label={settings.content.pages.mixing.label}
          title={settings.content.pages.mixing.title}
          subtitle={settings.content.pages.mixing.subtitle}
        />
        {works.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work, i) => (
              <MixBeforeAfter key={work.id} work={work} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-black/40">No mixing work yet. Check back soon.</p>
        )}
      </div>
    </section>
  );
}
