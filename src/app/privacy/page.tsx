import { getSiteSettings } from "@/lib/queries";
import { LegalDocument } from "@/components/LegalDocument";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: `${settings.content.legal.privacy_title} — WUTSHY` };
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <LegalDocument
      title={settings.content.legal.privacy_title}
      body={settings.content.legal.privacy_body}
    />
  );
}
