import { notFound } from "next/navigation";
import { getDrumKit } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { KitDetail } from "@/components/KitDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const kit = await getDrumKit(id);
  return { title: kit ? `${kit.title} — WUTSHY` : "Not found" };
}

export default async function DrumKitDetailPage({ params }: Props) {
  const { id } = await params;
  const [kit, settings] = await Promise.all([
    getDrumKit(id),
    getSiteSettings(),
  ]);
  if (!kit) notFound();

  return (
    <KitDetail
      kit={kit}
      payments={settings.payments}
      contactEmail={settings.contact.email}
    />
  );
}
