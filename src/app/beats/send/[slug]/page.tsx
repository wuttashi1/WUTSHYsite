import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtistCollection } from "@/lib/collection-queries";
import { ArtistSelection } from "@/components/ArtistSelection";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artist selection — WUTSHY", robots: { index: false, follow: false, nocache: true } };

export default async function ArtistSendPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getArtistCollection(slug);
  if (!result) notFound();
  return <ArtistSelection {...result} />;
}
