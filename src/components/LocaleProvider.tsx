"use client";
import { createContext, useContext, useEffect, useState, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { locales, translate, validLocale, type Locale } from "@/lib/i18n";
type Overrides = Partial<Record<Locale, Record<string, string>>>;
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; overrides: Overrides }>({ locale: "ru", setLocale: () => {}, overrides: {} });
export function LocaleProvider({ children, initialLocale, overrides = {} }: { children: ReactNode; initialLocale: Locale; overrides?: Overrides }) {
  const [locale, setLocale] = useState(initialLocale);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  function changeLocale(value: Locale) { setLocale(value); document.cookie = `wutshy-locale=${value};path=/;max-age=31536000;SameSite=Lax`; }
  return <LocaleContext.Provider value={{ locale, setLocale: changeLocale, overrides }}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  const context = useContext(LocaleContext);
  function t(text: string): string {
    const custom = context.overrides[context.locale]?.[text.trim()];
    if (custom !== undefined) return custom;
    if (text.includes("\n")) return text.split("\n").map(t).join("\n");
    return translate(text, context.locale);
  }
  return { ...context, t };
}
export function T({ children }: { children: ReactNode }) { const { t } = useLocale(); return typeof children === "string" ? t(children) : children; }
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return <label className="inline-flex shrink-0 items-center"><span className="sr-only">Language / Язык / Мова / Sprache</span><select value={locale} onChange={event => setLocale(validLocale(event.target.value))} className="rounded-full border border-white/20 bg-[#222] px-2.5 py-2 text-[11px] font-semibold text-white outline-offset-2">{locales.map(value => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label>;
}
export function LocalizedInput(props: InputHTMLAttributes<HTMLInputElement>) { const { t } = useLocale(); return <input {...props} placeholder={props.placeholder && t(props.placeholder)} aria-label={props["aria-label"] && t(props["aria-label"])} />; }
export function LocalizedTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { const { t } = useLocale(); return <textarea {...props} placeholder={props.placeholder && t(props.placeholder)} aria-label={props["aria-label"] && t(props["aria-label"])} />; }
