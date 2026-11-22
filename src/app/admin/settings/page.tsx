"use client";


import { HomeVideosSettings } from "@/components/admin/HomeVideosSettings";
import { parseYoutube } from "@/lib/home-videos";
import { ContactSettings } from "@/components/admin/ContactSettings";
import { SmtpSettings } from "@/components/admin/SmtpSettings";
import { contactProfile, validEmail, safeContactUrl } from "@/lib/contact";
import { T } from "@/components/LocaleProvider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_SETTINGS } from "@/lib/data";
import { SiteSettings } from "@/types";
import {
  Field,
  TextInput,
  Toggle,
  Button,
  useToast,
} from "@/components/admin/ui";
import { useHoverSound } from "@/hooks/useHoverSound";

export default function SettingsAdminPage() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(DEMO_SETTINGS);
  const [saving, setSaving] = useState(false);
  const { hoverProps } = useHoverSound(0.05);

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
        if (row.key === "contact") s.contact = contactProfile(v);
        if (row.key === "contact_it") s.contact_it = contactProfile(v);
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
    for (const profile of [settings.contact, settings.contact_it]) {
      if (!validEmail(profile.email) || [profile.instagram, profile.telegram, profile.github].some(url => url && !safeContactUrl(url))) {
        notify("Check contact email and HTTPS links", "error"); return;
      }
    }
    if (settings.featured_video.videos?.some(video => !parseYoutube(video.url))) {
      notify("Enter a valid HTTPS YouTube video or Shorts link.", "error"); return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("wutshy_settings").upsert([
      { key: "hero", value: settings.hero },
      { key: "social", value: settings.social },
      { key: "contact", value: settings.contact },
      { key: "contact_it", value: settings.contact_it },
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

  const socialKeys = ["spotify", "soundcloud"] as const;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold"><T>Settings</T></h1>
      <p className="mt-1 text-sm text-white/40"><T>
        Payments, socials, video and Telegram bot. Site texts are in Site Texts.
      </T></p>

      <div className="mt-8 max-w-2xl space-y-6">
        <ContactSettings title="Music contacts" value={settings.contact} onChange={contact => setSettings({ ...settings, contact })} />
        <ContactSettings title="IT contacts" value={settings.contact_it} onChange={contact_it => setSettings({ ...settings, contact_it })} />
        <SmtpSettings />

        {/* PayPal */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70"><T>PayPal payments</T></h2>
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

        <HomeVideosSettings value={settings.featured_video} onChange={featured_video => setSettings({ ...settings, featured_video })} />

        {/* Social */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-bold text-white/70"><T>Social links</T></h2>
          <p className="mt-1 text-xs text-white/30"><T>
            Toggle each link on/off. Only enabled links appear in the footer.
          </T></p>
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
          <h2 className="text-sm font-bold text-white/70"><T>Telegram bot</T></h2>
          <p className="mt-1 text-xs text-white/30"><T>
            Upload tracks to the site via Telegram. Bot starts with</T><T>{" "}</T>
            <code className="text-[#facc15]"><T>npm run dev</T></code><T>. Restart after
            saving.
          </T></p>
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
              <p className="font-medium text-white/70"><T>Bot commands:</T></p>
              <ul className="mt-2 space-y-1">
                <li><T>/addbeat — upload a new beat</T></li>
                <li><T>/addmix — upload mixing work</T></li>
                <li><T>/list — show recent works</T></li>
                <li><T>/delete &lt;id&gt; — delete a work</T></li>
                <li><T>/cancel — cancel current upload</T></li>
              </ul>
            </div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={saving} {...hoverProps}>
          <T>{saving ? "Saving..." : "Save all settings"}</T>
        </Button>
      </div>
    </div>
  );
}
