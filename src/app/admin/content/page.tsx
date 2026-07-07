"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import { DEMO_CONTENT } from "@/lib/data";
import { deepMergeContent } from "@/lib/content";
import { SiteContent, FaqItem } from "@/types";
import {
  Field,
  TextInput,
  TextArea,
  Button,
  useToast,
} from "@/components/admin/ui";
import { useHoverSound } from "@/hooks/useHoverSound";
import { Plus, Trash2 } from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm font-bold text-white/70">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function ContentAdminPage() {
  const { notify } = useToast();
  const { hoverProps } = useHoverSound(0.05);
  const [content, setContent] = useState<SiteContent>(DEMO_CONTENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("wutshy_settings")
        .select("*")
        .eq("key", "content")
        .maybeSingle();
      if (data?.value) {
        setContent(
          deepMergeContent(DEMO_CONTENT, data.value as Partial<SiteContent>)
        );
      }
    }
    load();
  }, []);

  const setHero = <K extends keyof SiteContent["hero"]>(
    key: K,
    value: SiteContent["hero"][K]
  ) => setContent((c) => ({ ...c, hero: { ...c.hero, [key]: value } }));

  const setAbout = <K extends keyof SiteContent["about"]>(
    key: K,
    value: SiteContent["about"][K]
  ) => setContent((c) => ({ ...c, about: { ...c.about, [key]: value } }));

  const setFaq = <K extends keyof SiteContent["faq"]>(
    key: K,
    value: SiteContent["faq"][K]
  ) => setContent((c) => ({ ...c, faq: { ...c.faq, [key]: value } }));

  const updateFaqItem = (index: number, patch: Partial<FaqItem>) => {
    setContent((c) => ({
      ...c,
      faq: {
        ...c.faq,
        items: c.faq.items.map((item, i) =>
          i === index ? { ...item, ...patch } : item
        ),
      },
    }));
  };

  const addFaqItem = () => {
    setContent((c) => ({
      ...c,
      faq: {
        ...c.faq,
        items: [...c.faq.items, { question: "", answer: "" }],
      },
    }));
  };

  const removeFaqItem = (index: number) => {
    setContent((c) => ({
      ...c,
      faq: {
        ...c.faq,
        items: c.faq.items.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    if (!isSupabaseConfigured()) {
      notify("Supabase not connected", "error");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("wutshy_settings").upsert([
      { key: "content", value: content },
      {
        key: "hero",
        value: {
          title: `${content.hero.title_prefix} ${content.hero.rotating_phrases.split("\n")[0] || ""}`.trim(),
          subtitle: content.hero.subtitle,
          tagline: content.hero.tagline,
        },
      },
    ]);
    setSaving(false);
    notify(error ? error.message : "Site texts saved", error ? "error" : "success");
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Site Texts</h1>
      <p className="mt-1 text-sm text-white/40">
        Edit all copy on the homepage, about page, footer, and legal pages.
      </p>

      <div className="mt-8 max-w-2xl space-y-6">
        <Section title="Hero (homepage)">
          <Field label="Tagline">
            <TextInput
              value={content.hero.tagline}
              onChange={(e) => setHero("tagline", e.target.value)}
            />
          </Field>
          <Field label="Title — first line">
            <TextInput
              value={content.hero.title_prefix}
              onChange={(e) => setHero("title_prefix", e.target.value)}
            />
          </Field>
          <Field
            label="Rotating phrases"
            hint="One phrase per line (animated gradient text)"
          >
            <TextArea
              rows={5}
              value={content.hero.rotating_phrases}
              onChange={(e) => setHero("rotating_phrases", e.target.value)}
            />
          </Field>
          <Field label="Subtitle">
            <TextArea
              rows={2}
              value={content.hero.subtitle}
              onChange={(e) => setHero("subtitle", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary button">
              <TextInput
                value={content.hero.cta_primary}
                onChange={(e) => setHero("cta_primary", e.target.value)}
              />
            </Field>
            <Field label="Secondary button">
              <TextInput
                value={content.hero.cta_secondary}
                onChange={(e) => setHero("cta_secondary", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title="About page">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Section label">
              <TextInput
                value={content.about.label}
                onChange={(e) => setAbout("label", e.target.value)}
              />
            </Field>
            <Field label="Title">
              <TextInput
                value={content.about.title}
                onChange={(e) => setAbout("title", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Paragraph 1">
            <TextArea
              rows={3}
              value={content.about.paragraph_1}
              onChange={(e) => setAbout("paragraph_1", e.target.value)}
            />
          </Field>
          <Field label="Paragraph 2">
            <TextArea
              rows={3}
              value={content.about.paragraph_2}
              onChange={(e) => setAbout("paragraph_2", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="FAQ (about page)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Section label">
              <TextInput
                value={content.faq.label}
                onChange={(e) => setFaq("label", e.target.value)}
              />
            </Field>
            <Field label="Title">
              <TextInput
                value={content.faq.title}
                onChange={(e) => setFaq("title", e.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-3">
            {content.faq.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/40">
                    Question {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaqItem(i)}
                    className="text-white/30 hover:text-red-400"
                    {...hoverProps}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <TextInput
                  value={item.question}
                  onChange={(e) => updateFaqItem(i, { question: e.target.value })}
                  placeholder="Question"
                />
                <TextArea
                  rows={2}
                  className="mt-2"
                  value={item.answer}
                  onChange={(e) => updateFaqItem(i, { answer: e.target.value })}
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={addFaqItem} {...hoverProps}>
            <span className="inline-flex items-center gap-1">
              <Plus size={14} /> Add question
            </span>
          </Button>
        </Section>

        <Section title="Homepage sections">
          <Field label="Browse by category — title">
            <TextInput
              value={content.home.browse.title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    browse: { ...c.home.browse, title: e.target.value },
                  },
                }))
              }
            />
          </Field>
          <Field label="Browse by category — subtitle">
            <TextInput
              value={content.home.browse.subtitle}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    browse: { ...c.home.browse, subtitle: e.target.value },
                  },
                }))
              }
            />
          </Field>
          {(
            [
              ["beats_card", "Beats card"],
              ["mixing_card", "Mixing card"],
              ["drum_kits_card", "Drum kits card"],
              ["placements_card", "Placements card"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-xl bg-white/5 p-3">
              <p className="mb-2 text-xs font-medium text-white/50">{label}</p>
              <TextInput
                value={content.home[key].title}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    home: {
                      ...c.home,
                      [key]: { ...c.home[key], title: e.target.value },
                    },
                  }))
                }
                placeholder="Title"
              />
              <TextInput
                className="mt-2"
                value={content.home[key].description}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    home: {
                      ...c.home,
                      [key]: { ...c.home[key], description: e.target.value },
                    },
                  }))
                }
                placeholder="Description"
              />
            </div>
          ))}
          <Field label="Featured beats — title">
            <TextInput
              value={content.home.featured_beats.title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    featured_beats: {
                      ...c.home.featured_beats,
                      title: e.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
          <Field label="Featured beats — subtitle">
            <TextInput
              value={content.home.featured_beats.subtitle}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    featured_beats: {
                      ...c.home.featured_beats,
                      subtitle: e.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
          <Field label="Featured beats — button">
            <TextInput
              value={content.home.featured_beats.cta}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    featured_beats: {
                      ...c.home.featured_beats,
                      cta: e.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
          <Field label="Shop drum kits — title">
            <TextInput
              value={content.home.shop_drums.title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    shop_drums: { ...c.home.shop_drums, title: e.target.value },
                  },
                }))
              }
            />
          </Field>
          <Field label="Shop drum kits — subtitle">
            <TextInput
              value={content.home.shop_drums.subtitle}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    shop_drums: {
                      ...c.home.shop_drums,
                      subtitle: e.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
          <Field label="Placements section — title">
            <TextInput
              value={content.home.placements.title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    placements: { ...c.home.placements, title: e.target.value },
                  },
                }))
              }
            />
          </Field>
          <Field label="Placements section — subtitle">
            <TextInput
              value={content.home.placements.subtitle}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    placements: {
                      ...c.home.placements,
                      subtitle: e.target.value,
                    },
                  },
                }))
              }
            />
          </Field>
          <Field label="Featured video — subtitle">
            <TextInput
              value={content.home.featured_video_subtitle}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  home: {
                    ...c.home,
                    featured_video_subtitle: e.target.value,
                  },
                }))
              }
            />
          </Field>
        </Section>

        <Section title="Page headers">
          {(
            [
              ["beats", "Beats page"],
              ["drum_kits", "Drum kits page"],
              ["placements", "Placements (beats page)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-xl bg-white/5 p-3">
              <p className="mb-2 text-xs font-medium text-white/50">{label}</p>
              <TextInput
                value={content.pages[key].title}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    pages: {
                      ...c.pages,
                      [key]: { ...c.pages[key], title: e.target.value },
                    },
                  }))
                }
                placeholder="Title"
              />
              <TextInput
                className="mt-2"
                value={content.pages[key].subtitle}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    pages: {
                      ...c.pages,
                      [key]: { ...c.pages[key], subtitle: e.target.value },
                    },
                  }))
                }
                placeholder="Subtitle"
              />
            </div>
          ))}
          <div className="rounded-xl bg-white/5 p-3">
            <p className="mb-2 text-xs font-medium text-white/50">Mixing page</p>
            <TextInput
              value={content.pages.mixing.label}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  pages: {
                    ...c.pages,
                    mixing: { ...c.pages.mixing, label: e.target.value },
                  },
                }))
              }
              placeholder="Label"
            />
            <TextInput
              className="mt-2"
              value={content.pages.mixing.title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  pages: {
                    ...c.pages,
                    mixing: { ...c.pages.mixing, title: e.target.value },
                  },
                }))
              }
              placeholder="Title"
            />
            <TextArea
              rows={2}
              className="mt-2"
              value={content.pages.mixing.subtitle}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  pages: {
                    ...c.pages,
                    mixing: { ...c.pages.mixing, subtitle: e.target.value },
                  },
                }))
              }
              placeholder="Subtitle"
            />
          </div>
        </Section>

        <Section title="Footer">
          <Field label="Tagline (under logo)">
            <TextInput
              value={content.footer.tagline}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  footer: { ...c.footer, tagline: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Contact block text">
            <TextArea
              rows={2}
              value={content.footer.contact_text}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  footer: { ...c.footer, contact_text: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Copyright">
            <TextInput
              value={content.footer.copyright}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  footer: { ...c.footer, copyright: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Section title="Terms of Service">
          <Field label="Page title">
            <TextInput
              value={content.legal.terms_title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  legal: { ...c.legal, terms_title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Content" hint="Separate paragraphs with a blank line">
            <TextArea
              rows={12}
              value={content.legal.terms_body}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  legal: { ...c.legal, terms_body: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Section title="Privacy Policy">
          <Field label="Page title">
            <TextInput
              value={content.legal.privacy_title}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  legal: { ...c.legal, privacy_title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Content" hint="Separate paragraphs with a blank line">
            <TextArea
              rows={12}
              value={content.legal.privacy_body}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  legal: { ...c.legal, privacy_body: e.target.value },
                }))
              }
            />
          </Field>
        </Section>

        <Button onClick={handleSave} disabled={saving} {...hoverProps}>
          {saving ? "Saving..." : "Save all texts"}
        </Button>
      </div>
    </div>
  );
}
