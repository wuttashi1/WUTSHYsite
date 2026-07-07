import { notFound } from "next/navigation";
import { getWork, getWorks } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { BeatDetail } from "@/components/BeatDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const work = await getWork(id);
  return { title: work ? `${work.title} — WUTSHY` : "Not found" };
}

export default async function BeatDetailPage({ params }: Props) {
  const { id } = await params;
  const [work, settings] = await Promise.all([getWork(id), getSiteSettings()]);
  if (!work) notFound();

  const all = await getWorks(work.type);
  const related = all.filter((w) => w.id !== work.id).slice(0, 3);

  return (
    <BeatDetail
      work={work}
      related={related}
      payments={settings.payments}
      contactEmail={settings.contact.email}
    />
  );
}
