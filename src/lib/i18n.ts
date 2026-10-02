import messages from "./translations.json";
export const locales = ["ru", "uk", "en", "de"] as const;
export type Locale = typeof locales[number];
export function validLocale(value: unknown): Locale { return locales.includes(value as Locale) ? value as Locale : "ru"; }
export function translate(text: string, locale: Locale): string {
  const entry = (messages as Record<string, string[]>)[text.trim()];
  if (entry) return text.replace(text.trim(), entry[locales.indexOf(locale)] || text.trim());
  const search = text.match(/^Results for “(.*)”$/);
  if (search) return `${translate("Search results", locale)}: “${search[1]}”`;
  const count = text.match(/^(\d+) results? found$/);
  if (count) return `${translate("Results found", locale)}: ${count[1]}`;
  const deletion = text.match(/^"(.*)" (will be permanently removed\.|will be removed from this kit\.|and all its tracks will be permanently removed\.)$/);
  if (deletion) return `“${deletion[1]}” — ${translate(deletion[2], locale)}`;
  if (text.includes("\n")) return text.split("\n").map(line => translate(line, locale)).join("\n");
  return text;
}

export function translateContent<T>(value: T, locale: Locale): T {
  if (typeof value === "string") return translate(value, locale) as T;
  if (Array.isArray(value)) return value.map(item => translateContent(item, locale)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateContent(item, locale)])) as T;
  return value;
}

export function contentDictionary(base: unknown, localized: unknown, result: Record<string, string> = {}): Record<string, string> {
  if (typeof base === "string" && typeof localized === "string") {
    result[base.trim()] = localized;
    const sourceLines = base.split("\n"); const targetLines = localized.split("\n");
    if (sourceLines.length === targetLines.length) sourceLines.forEach((line, index) => { if (line.trim()) result[line.trim()] = targetLines[index]; });
  } else if (base && localized && typeof base === "object" && typeof localized === "object") {
    for (const key of Object.keys(base)) contentDictionary((base as Record<string, unknown>)[key], (localized as Record<string, unknown>)[key], result);
  }
  return result;
}
