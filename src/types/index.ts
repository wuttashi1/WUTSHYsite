export type WorkType = "beat" | "mixing" | "placement";
export type SpotifyType = "track" | "playlist" | "album";

export interface SocialLink {
  url: string;
  enabled: boolean;
}

export interface Work {
  id: string;
  type: WorkType;
  title: string;
  artist: string | null;
  description: string | null;
  cover_url: string | null;
  cover_video_url: string | null;
  audio_url: string | null;
  audio_before_url: string | null;
  spotify_url: string | null;
  spotify_type: SpotifyType | null;
  price: number | null;
  currency: string;
  bpm: number | null;
  musical_key: string | null;
  tags: string[];
  accent_color: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface DrumKit {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  cover_url: string | null;
  cover_video_url: string | null;
  buy_url: string | null;
  tags: string[];
  is_new: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  tracks?: DrumKitTrack[];
}

export interface DrumKitTrack {
  id: string;
  drum_kit_id: string;
  title: string;
  audio_url: string | null;
  duration_seconds: number | null;
  sort_order: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteContent {
  hero: {
    tagline: string;
    title_prefix: string;
    rotating_phrases: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
  };
  about: {
    label: string;
    title: string;
    paragraph_1: string;
    paragraph_2: string;
  };
  faq: {
    label: string;
    title: string;
    items: FaqItem[];
  };
  pages: {
    beats: { title: string; subtitle: string };
    mixing: { label: string; title: string; subtitle: string };
    drum_kits: { title: string; subtitle: string };
    placements: { title: string; subtitle: string };
  };
  home: {
    browse: { title: string; subtitle: string };
    beats_card: { title: string; description: string };
    mixing_card: { title: string; description: string };
    drum_kits_card: { title: string; description: string };
    placements_card: { title: string; description: string };
    featured_beats: { title: string; subtitle: string; cta: string };
    shop_drums: { title: string; subtitle: string };
    placements: { title: string; subtitle: string };
    featured_video_subtitle: string;
  };
  footer: {
    tagline: string;
    contact_text: string;
    copyright: string;
  };
  legal: {
    terms_title: string;
    terms_body: string;
    privacy_title: string;
    privacy_body: string;
  };
}

export interface SiteSettings {
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
  };
  content: SiteContent;
  social: {
    instagram: SocialLink;
    spotify: SocialLink;
    soundcloud: SocialLink;
    telegram: SocialLink;
  };
  contact: {
    email: string;
    show_email: boolean;
  };
  payments: {
    paypal_email: string;
    enabled: boolean;
  };
  featured_video: {
    youtube_url: string;
    enabled: boolean;
    title: string;
    video_title: string;
    author: string;
    thumbnail_url: string;
  };
  telegram: {
    bot_token: string;
    chat_id: string;
    enabled: boolean;
  };
}

export interface WorkFormData {
  type: WorkType;
  title: string;
  artist: string;
  description: string;
  cover_url: string;
  cover_video_url: string;
  audio_url: string;
  audio_before_url: string;
  spotify_url: string;
  spotify_type: SpotifyType | "";
  price: string;
  currency: string;
  bpm: string;
  musical_key: string;
  tags: string;
  accent_color: string;
  is_featured: boolean;
  sort_order: number;
}

export interface DrumKitFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  cover_url: string;
  cover_video_url: string;
  buy_url: string;
  tags: string;
  is_new: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface PlayerTrack {
  id: string;
  title: string;
  subtitle?: string;
  audioUrl: string;
  coverUrl?: string | null;
  coverVideoUrl?: string | null;
}
