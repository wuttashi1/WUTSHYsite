import { searchContent } from "@/lib/queries";
import { WorkCard } from "@/components/WorkCard";
import { PlacementCard } from "@/components/PlacementCard";
import { DrumKitCard } from "@/components/DrumKitCard";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "Search — WUTSHY",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const { works, kits } = query
    ? await searchContent(query)
    : { works: [], kits: [] };

  const beats = works.filter((w) => w.type !== "placement");
  const placements = works.filter((w) => w.type === "placement");
  const total = works.length + kits.length;

  return (
    <section className="py-16 pb-28 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          label="Search"
          title={query ? `Results for “${query}”` : "Search"}
          subtitle={
            query
              ? `${total} result${total === 1 ? "" : "s"} found`
              : "Type in the search bar to find beats, mixing work, placements and drum kits."
          }
        />

        {query && total === 0 && (
          <p className="mt-8 text-black/40">
            Nothing matched your search. Try a different keyword.
          </p>
        )}

        {beats.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold">Beats & Mixing</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beats.map((work, i) => (
                <WorkCard key={work.id} work={work} index={i} queue={beats} />
              ))}
            </div>
          </div>
        )}

        {placements.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-bold">Placements</h2>
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
        )}

        {kits.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-bold">Drum Kits</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {kits.map((kit, i) => (
                <DrumKitCard key={kit.id} kit={kit} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
