import {
  Work,
  DrumKit,
  DrumKitTrack,
  SiteSettings,
  SiteContent,
  PlayerTrack,
} from "@/types";

const base = {
  artist: null,
  cover_url: null,
  cover_video_url: null,
  audio_url: null,
  audio_before_url: null,
  spotify_url: null,
  spotify_type: null,
  price: null,
  currency: "EUR",
  bpm: null,
  musical_key: null,
  accent_color: "#facc15",
};

export const DEMO_WORKS: Work[] = [
  {
    ...base,
    id: "1",
    type: "beat",
    title: "midnight drive",
    description:
      "Dark melodic trap with atmospheric pads and hard-hitting 808s.",
    tags: ["trap", "melodic", "dark"],
    bpm: 140,
    musical_key: "F# min",
    price: 29.99,
    is_featured: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    ...base,
    id: "2",
    type: "beat",
    title: "neon pulse",
    description: "Bouncy new jazz vibes with swung drums and warm keys.",
    tags: ["new jazz", "bouncy", "loops"],
    bpm: 128,
    musical_key: "C maj",
    price: 24.99,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    ...base,
    id: "3",
    type: "mixing",
    title: "artist x — single mix",
    artist: "Artist X",
    description: "Full vocal mix and master. Clean low end, wide stereo image.",
    spotify_type: "track",
    tags: ["mixing", "mastering", "vocal"],
    is_featured: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    ...base,
    id: "4",
    type: "placement",
    title: "underground hit",
    artist: "Various",
    description: "Beat placed on a major release.",
    tags: ["placement"],
    accent_color: "#facc15",
    is_featured: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
  {
    ...base,
    id: "5",
    type: "placement",
    title: "club anthem",
    artist: "Various",
    description: "Featured on a trending playlist.",
    tags: ["placement"],
    accent_color: "#f472b6",
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
];

export const DEMO_DRUM_KITS: DrumKit[] = [
  {
    id: "1",
    title: "wutshy — untitled kit +",
    description:
      "370 custom made sounds. Drums, oneshots, loops & midi included.",
    price: 29.99,
    currency: "EUR",
    cover_url: null,
    cover_video_url: null,
    buy_url: null,
    tags: ["drums", "oneshots", "midi", "loops"],
    is_new: true,
    is_featured: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    tracks: [
      { id: "t1", drum_kit_id: "1", title: "wutshy — busted 159", audio_url: null, duration_seconds: 132, sort_order: 0 },
      { id: "t2", drum_kit_id: "1", title: "wutshy — phph 147", audio_url: null, duration_seconds: 98, sort_order: 1 },
      { id: "t3", drum_kit_id: "1", title: "wutshy — maddie 138", audio_url: null, duration_seconds: 156, sort_order: 2 },
    ],
  },
  {
    id: "2",
    title: "wutshy — swee kit",
    description: "Melodic loops and bouncy drums for your next cookup.",
    price: 24.99,
    currency: "EUR",
    cover_url: null,
    cover_video_url: null,
    buy_url: null,
    tags: ["loops", "bouncy", "melodic"],
    is_new: false,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    tracks: [
      { id: "t4", drum_kit_id: "2", title: "wutshy — fightnight 154", audio_url: null, duration_seconds: 120, sort_order: 0 },
    ],
  },
];

const DEFAULT_TERMS = `Last updated: 2026

1. Acceptance of Terms
By accessing and using the WUTSHY website, you agree to these Terms of Service.

2. Digital Products
Beats, drum kits, and other digital products sold through this site are licensed for use in your own musical productions unless otherwise stated at the time of purchase.

3. Payments
All payments are processed through third-party providers. WUTSHY is not responsible for issues caused by payment processors.

4. Refunds
Due to the digital nature of the products, all sales are final unless required by applicable law or agreed otherwise in writing.

5. Intellectual Property
All content on this website — including beats, kits, artwork, and branding — remains the property of WUTSHY unless a separate license agreement is provided.

6. Contact
For questions about these terms, contact us using the email listed on the website.`;

const DEFAULT_PRIVACY = `Last updated: 2026

1. Information We Collect
We may collect your email address when you contact us or complete a purchase. Payment information is handled by third-party payment providers and is not stored on our servers.

2. How We Use Information
We use your information to respond to inquiries, process orders, and improve the website experience.

3. Cookies
This site may use cookies for authentication (admin panel) and basic functionality.

4. Third-Party Services
We use services such as Supabase, PayPal, Spotify, and YouTube embeds. These services have their own privacy policies.

5. Data Security
We take reasonable measures to protect your data, but no online service can guarantee complete security.

6. Your Rights
You may request access to or deletion of your personal data by contacting us via the email on this website.

7. Contact
For privacy-related questions, reach out using the contact email listed in the footer.`;

export const DEMO_CONTENT: SiteContent = {
  hero: {
    tagline: "Producer & Mix Engineer",
    title_prefix: "Stop settling for",
    rotating_phrases:
      "generic sounds.\noutdated 808s.\nrecycled snares.\nflat vocals.\nboring loops.",
    subtitle:
      "Beats, mixing, drum kits — crafted to inspire your next session.",
    cta_primary: "Explore beats",
    cta_secondary: "Drum kits →",
  },
  about: {
    label: "About",
    title: "WUTSHY®",
    paragraph_1:
      "Producer & Mix Engineer. I make beats, drum kits, and mix records for artists worldwide. My sound blends trap, new jazz, and experimental textures.",
    paragraph_2:
      "Whether you need a hard-hitting drum kit, a custom beat, or a clean vocal mix — I've got you covered.",
  },
  faq: {
    label: "FAQ",
    title: "Frequently Asked Questions",
    items: [
      {
        question: "Who is WUTSHY?",
        answer:
          "WUTSHY is a music producer and mix engineer. I create beats, drum kits, and provide professional mixing services.",
      },
      {
        question: "Are the sounds royalty free?",
        answer:
          "Yes, all drum kits and beats come with a royalty-free license for your productions.",
      },
      {
        question: "How do I purchase a drum kit?",
        answer:
          "Contact me through social media or email. I'll send you a payment link and download access.",
      },
      {
        question: "Do you offer mixing services?",
        answer:
          "Yes! Send me your stems and I'll deliver a professional mix within 3-5 business days.",
      },
    ],
  },
  pages: {
    beats: {
      title: "Beats",
      subtitle: "Original productions — from trap to new jazz and beyond.",
    },
    mixing: {
      label: "Before / After",
      title: "Mixing Portfolio",
      subtitle:
        "Toggle between the raw take and the mixed & mastered version — the raw preview is shown desaturated on purpose.",
    },
    drum_kits: {
      title: "Drum Kits",
      subtitle:
        "Custom drums, oneshots, loops & midi — everything you need to cook.",
    },
    placements: {
      title: "Placements",
      subtitle: "Records featuring WUTSHY productions.",
    },
  },
  home: {
    browse: {
      title: "Browse by Category",
      subtitle:
        "Discover beats, mixing work, and drum kits — everything in one place.",
    },
    beats_card: {
      title: "Beats",
      description: "Original productions — trap, new jazz, melodic and more.",
    },
    mixing_card: {
      title: "Mixing",
      description: "Professional vocal mixing and mastering — before & after.",
    },
    drum_kits_card: {
      title: "Drum Kits",
      description: "Custom drums, oneshots, loops & midi — ready to cook.",
    },
    placements_card: {
      title: "Placements",
      description: "Real records made with WUTSHY sounds.",
    },
    featured_beats: {
      title: "Featured Beats",
      subtitle: "Find the right sounds for your inspiration.",
      cta: "View all beats →",
    },
    shop_drums: {
      title: "Shop Drum Kits",
      subtitle: "Find the perfect kit for your next cookup.",
    },
    placements: {
      title: "Hear My Sounds in Action",
      subtitle: "Real records made with WUTSHY sounds.",
    },
    featured_video_subtitle: "Watch the latest from WUTSHY",
  },
  footer: {
    tagline: "Beats, mixing & drum kits.",
    contact_text:
      "For beats, mixing services, or drum kit purchases — reach out via email or socials.",
    copyright: "© 2026 WUTSHY. All rights reserved.",
  },
  legal: {
    terms_title: "Terms of Service",
    terms_body: DEFAULT_TERMS,
    privacy_title: "Privacy Policy",
    privacy_body: DEFAULT_PRIVACY,
  },
};

export const DEMO_SETTINGS: SiteSettings = {
  hero: {
    title: "Stop settling for generic sounds.",
    subtitle:
      "Beats, mixing, drum kits — crafted to inspire your next session.",
    tagline: "Producer & Mix Engineer",
  },
  content: DEMO_CONTENT,
  social: {
    instagram: { url: "", enabled: false },
    spotify: { url: "", enabled: false },
    soundcloud: { url: "", enabled: false },
    telegram: { url: "", enabled: false },
  },
  contact: {
    email: "den.velikiy562381@gmail.com",
    show_email: true,
  },
  payments: {
    paypal_email: "",
    enabled: false,
  },
  featured_video: {
    youtube_url: "",
    enabled: false,
    title: "",
    video_title: "",
    author: "",
    thumbnail_url: "",
  },
  telegram: {
    bot_token: "",
    chat_id: "",
    enabled: false,
  },
};

export function parseRotatingPhrases(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function getPaypalLink(
  email: string,
  amount: number,
  currency: string,
  itemName: string
): string {
  const params = new URLSearchParams({
    cmd: "_xclick",
    business: email,
    item_name: itemName,
    amount: amount.toFixed(2),
    currency_code: currency,
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatPrice(price: number | null, currency: string): string {
  if (price === null || price === undefined) return "";
  try {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

export function parseTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function getSpotifyEmbedUrl(
  url: string,
  type: string | null
): string | null {
  if (!url) return null;
  const match = url.match(
    /spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/
  );
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  if (type && url.length > 10 && /^[a-zA-Z0-9]+$/.test(url)) {
    return `https://open.spotify.com/embed/${type}/${url}?utm_source=generator&theme=0`;
  }
  return null;
}

export function isVideo(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export function workToTrack(work: Work): PlayerTrack {
  return {
    id: work.id,
    title: work.title,
    subtitle: work.artist || work.type,
    audioUrl: work.audio_url || "",
    coverUrl: work.cover_url,
    coverVideoUrl: work.cover_video_url,
  };
}

export function kitTrackToTrack(
  track: DrumKitTrack,
  kit?: DrumKit
): PlayerTrack {
  return {
    id: track.id,
    title: track.title,
    subtitle: kit?.title,
    audioUrl: track.audio_url || "",
    coverUrl: kit?.cover_url,
    coverVideoUrl: kit?.cover_video_url,
  };
}
