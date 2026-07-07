"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_SETTINGS } from "@/lib/data";
import { SiteSettings } from "@/types";
import {
  Field,
  TextInput,
  TextArea,
  Toggle,
  Button,
  useToast,
} from "@/components/admin/ui";
import { useHoverSound } from "@/hooks/useHoverSound";

export default function SettingsAdminPage() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(DEMO_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [fetchingYt, setFetchingYt] = useState(false);
  const { hoverProps } = useHoverSound(0.05);

  const fetchYoutubeInfo = async () => {
    const url = settings.featured_video.youtube_url.trim();
    if (!url) {
      notify("Paste a YouTube link first", "error");
      return;
    }
    setFetchingYt(true);
    try {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Could not fetch video info", "error");
        return;
      }
      setSettings((s) => ({
        ...s,
        featured_video: {
          ...s.featured_video,
          video_title: data.video_title || "",
          author: data.author || "",
          thumbnail_url: data.thumbnail_url || "",
        },
      }));
      notify("Pulled video info from YouTube");
    } catch {
      notify("Failed to reach YouTube", "error");
    } finally {
      setFetchingYt(false);
    }
  };

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const { data } = await supabase.from("wutshy_settings").select("*");
      if (!data?.length) return;

      const s = JSON.parse(JSON.stringify(DEMO_SETTINGS)) as SiteSettings;
      for (const row of data) {
        const v = row.value;
        if (row.key === "hero") s.hero = { ...s.hero, ...v };
        if (row.key === "social") {
          for (const key of ["instagram", "spotify", "soundcloud", "telegram"] as const) {
            const val = v[key];
            if (typeof val === "string") s.social[key] = { url: val, enabled: !!val };
            else if (val) s.social[key] = { url: val.url || "", enabled: !!val.enabled };
          }
        }
        if (row.key === "contact") s.contact = { ...s.contact, ...v };
        if (row.key === "payments") s.payments = { ...s.payments, ...v };
        if (row.key === "featured_video")
          s.featured_video = { ...s.featured_video, ...v };
        if (row.key === "telegram") s.telegram = { ...s.telegram, ...v };
      }
      setSettings(s);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!isSupabaseConfigured()) {
      notify("Supabase not connected", "error");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("wutshy_settings").upsert([
      { key: "hero", value: settings.hero },
      { key: "social", value: settings.social },
      { key: "contact", value: settings.contact },
      { key: "payments", value: settings.payments },
      { key: "featured_video", value: settings.featured_video },
      { key: "telegram", value: settings.telegram },
    ]);
    setSaving(false);
    notify(
      error ? error.message : "Settings saved. Restart dev server for bot changes.",
      error ? "error" : "success"
    );
  };

  const socialKeys = ["instagram", "spotify", "soundcloud", "telegram"] as const;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-white/40">
        Payments, socials, video and Telegram bot. Site texts are in Site Texts.
      </p>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Contact */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70">Contact</h2>
          <div className="mt-4 space-y-3">
            <Field label="Email for contact & purchases">
              <TextInput
                type="email"
                value={settings.contact.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, email: e.target.value },
                  })
                }
              />
            </Field>
            <Toggle
              checked={settings.contact.show_email}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, show_email: v },
                })
              }
              label="Show email in footer"
            />
          </div>
        </section>

        {/* PayPal */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70">PayPal payments</h2>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={settings.payments.enabled}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  payments: { ...settings.payments, enabled: v },
                })
              }
              label="Enable PayPal buttons on product pages"
            />
            <Field label="PayPal email" hint="Your PayPal.me or business email">
              <TextInput
                type="email"
                value={settings.payments.paypal_email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payments: { ...settings.payments, paypal_email: e.target.value },
                  })
                }
                placeholder="your@paypal.com"
              />
            </Field>
          </div>
        </section>

        {/* Featured Video */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70">Featured video (homepage)</h2>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={settings.featured_video.enabled}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  featured_video: { ...settings.featured_video, enabled: v },
                })
              }
              label="Show featured video on homepage"
            />
            <Field label="YouTube URL">
              <TextInput
                value={settings.featured_video.youtube_url}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    featured_video: {
                      ...settings.featured_video,
                      youtube_url: e.target.value,
                    },
                  })
                }
                onBlur={(e) => {
                  if (e.target.value.trim()) fetchYoutubeInfo();
                }}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Field>

            {settings.featured_video.youtube_url && (
              <Button
                variant="ghost"
                onClick={fetchYoutubeInfo}
                disabled={fetchingYt}
                {...hoverProps}
              >
                {fetchingYt ? "Fetching..." : "Pull video info from YouTube"}
              </Button>
            )}

            {settings.featured_video.video_title && (
              <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                {settings.featured_video.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.featured_video.thumbnail_url}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {settings.featured_video.video_title}
                  </p>
                  {settings.featured_video.author && (
                    <p className="truncate text-xs text-white/40">
                      {settings.featured_video.author}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Field label="Section title (optional)">
              <TextInput
                value={settings.featured_video.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    featured_video: {
                      ...settings.featured_video,
                      title: e.target.value,
                    },
                  })
                }
                placeholder="Featured Video"
              />
            </Field>
          </div>
        </section>

        {/* Social */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70">Social links</h2>
          <p className="mt-1 text-xs text-white/30">
            Toggle each link on/off. Only enabled links appear in the footer.
          </p>
          <div className="mt-4 space-y-4">
            {socialKeys.map((key) => (
              <div key={key} className="rounded-xl bg-white/5 p-3">
                <Toggle
                  checked={settings.social[key].enabled}
                  onChange={(v) =>
                    setSettings({
                      ...settings,
                      social: {
                        ...settings.social,
                        [key]: { ...settings.social[key], enabled: v },
                      },
                    })
                  }
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                />
                <div className="mt-2">
                  <TextInput
                    value={settings.social[key].url}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          [key]: { ...settings.social[key], url: e.target.value },
                        },
                      })
                    }
                    placeholder={`https://${key}.com/...`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Telegram Bot */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70">Telegram bot</h2>
          <p className="mt-1 text-xs text-white/30">
            Upload tracks to the site via Telegram. Bot starts with{" "}
            <code className="text-[#facc15]">npm run dev</code>. Restart after
            saving.
          </p>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={settings.telegram.enabled}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  telegram: { ...settings.telegram, enabled: v },
                })
              }
              label="Enable Telegram bot"
            />
            <Field label="Bot token" hint="From @BotFather">
              <TextInput
                type="password"
                value={settings.telegram.bot_token}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, bot_token: e.target.value },
                  })
                }
                placeholder="123456:ABC-DEF..."
              />
            </Field>
            <Field
              label="Your Telegram chat ID"
              hint="Send /start to @userinfobot to get your ID"
            >
              <TextInput
                value={settings.telegram.chat_id}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, chat_id: e.target.value },
                  })
                }
                placeholder="617434707"
              />
            </Field>
            <div className="rounded-xl bg-white/5 p-3 text-xs text-white/50">
              <p className="font-medium text-white/70">Bot commands:</p>
              <ul className="mt-2 space-y-1">
                <li>/addbeat — upload a new beat</li>
                <li>/addmix — upload mixing work</li>
                <li>/list — show recent works</li>
                <li>/delete &lt;id&gt; — delete a work</li>
                <li>/cancel — cancel current upload</li>
              </ul>
            </div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={saving} {...hoverProps}>
          {saving ? "Saving..." : "Save all settings"}
        </Button>
      </div>
    </div>
  );
}
