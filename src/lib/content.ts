import { SiteContent } from "@/types";

export function deepMergeContent(
  base: SiteContent,
  patch: Partial<SiteContent>
): SiteContent {
  return {
    hero: { ...base.hero, ...patch.hero },
    about: { ...base.about, ...patch.about },
    faq: {
      ...base.faq,
      ...patch.faq,
      items: patch.faq?.items?.length ? patch.faq.items : base.faq.items,
    },
    pages: {
      beats: { ...base.pages.beats, ...patch.pages?.beats },
      mixing: { ...base.pages.mixing, ...patch.pages?.mixing },
      drum_kits: { ...base.pages.drum_kits, ...patch.pages?.drum_kits },
      placements: { ...base.pages.placements, ...patch.pages?.placements },
    },
    home: {
      browse: { ...base.home.browse, ...patch.home?.browse },
      beats_card: { ...base.home.beats_card, ...patch.home?.beats_card },
      mixing_card: { ...base.home.mixing_card, ...patch.home?.mixing_card },
      drum_kits_card: {
        ...base.home.drum_kits_card,
        ...patch.home?.drum_kits_card,
      },
      placements_card: {
        ...base.home.placements_card,
        ...patch.home?.placements_card,
      },
      featured_beats: {
        ...base.home.featured_beats,
        ...patch.home?.featured_beats,
      },
      shop_drums: { ...base.home.shop_drums, ...patch.home?.shop_drums },
      placements: { ...base.home.placements, ...patch.home?.placements },
      featured_video_subtitle:
        patch.home?.featured_video_subtitle ?? base.home.featured_video_subtitle,
    },
    footer: { ...base.footer, ...patch.footer },
    legal: { ...base.legal, ...patch.legal },
  };
}
