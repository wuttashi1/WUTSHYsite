import { SiteSettings } from "@/types";
import { DEMO_SETTINGS } from "@/lib/data";
import { deepMergeContent } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

function mergeSettings(rows: { key: string; value: unknown }[]): SiteSettings {
  const s: SiteSettings = JSON.parse(JSON.stringify(DEMO_SETTINGS));

  for (const row of rows) {
    const v = row.value as Record<string, unknown>;
    switch (row.key) {
      case "hero":
        s.hero = { ...s.hero, ...(v as SiteSettings["hero"]) };
        break;
      case "social": {
        const social = v as Record<string, unknown>;
        for (const key of ["instagram", "spotify", "soundcloud", "telegram"] as const) {
          const val = social[key];
          if (typeof val === "string") {
            s.social[key] = { url: val, enabled: !!val };
          } else if (val && typeof val === "object") {
            s.social[key] = {
              url: (val as { url?: string }).url || "",
              enabled: !!(val as { enabled?: boolean }).enabled,
            };
          }
        }
        break;
      }
      case "contact":
        s.contact = { ...s.contact, ...(v as SiteSettings["contact"]) };
        break;
      case "payments":
        s.payments = { ...s.payments, ...(v as SiteSettings["payments"]) };
        break;
      case "featured_video":
        s.featured_video = {
          ...s.featured_video,
          ...(v as SiteSettings["featured_video"]),
        };
        break;
      case "telegram":
        s.telegram = { ...s.telegram, ...(v as SiteSettings["telegram"]) };
        break;
      case "content":
        s.content = deepMergeContent(s.content, v as Partial<SiteSettings["content"]>);
        break;
    }
  }

  if (!rows.some((row) => row.key === "content")) {
    s.content = {
      ...s.content,
      hero: {
        ...s.content.hero,
        tagline: s.hero.tagline || s.content.hero.tagline,
        subtitle: s.hero.subtitle || s.content.hero.subtitle,
      },
    };
  }

  return s;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return DEMO_SETTINGS;

  const supabase = await createClient();
  const { data } = await supabase.from("wutshy_settings").select("*");
  if (!data?.length) return DEMO_SETTINGS;
  return mergeSettings(data);
}
