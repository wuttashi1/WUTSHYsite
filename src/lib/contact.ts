export interface ContactProfile {
  email: string; show_email: boolean; form_enabled: boolean; telegram_notifications: boolean;
  instagram: string; telegram: string; github: string; discord: string;
}
export const DEFAULT_CONTACT: ContactProfile = {
  email: "den.velikiy562381@gmail.com", show_email: true, form_enabled: true, telegram_notifications: true,
  instagram: "https://www.instagram.com/wutshy/", telegram: "https://t.me/spirit_link", github: "https://github.com/wuttashi1", discord: "wutshy",
};
export function safeContactUrl(value: string): string {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; } catch { return ""; }
}
export function contactProfile(value: unknown): ContactProfile {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const result = { ...DEFAULT_CONTACT };
  for (const key of Object.keys(result) as (keyof ContactProfile)[]) {
    if (typeof input[key] === typeof result[key]) Object.assign(result, { [key]: input[key] });
  }
  for (const key of ["instagram", "telegram", "github"] as const) result[key] = safeContactUrl(result[key]);
  return result;
}
export function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(value);
}
export function parseInquiry(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.area !== "music" && v.area !== "it") return null;
  if (typeof v.name !== "string" || !v.name.trim() || v.name.length > 100 || /[\r\n]/.test(v.name)) return null;
  if (!validEmail(v.email) || typeof v.message !== "string" || v.message.trim().length < 10 || v.message.length > 3000) return null;
  if (typeof v.website !== "string" || v.website.length || v.consent !== true) return null;
  return { area: v.area, name: v.name.trim(), email: v.email.trim(), message: v.message.trim() };
}
