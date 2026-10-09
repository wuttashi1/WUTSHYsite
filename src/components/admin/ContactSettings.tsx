"use client";
import { T } from "@/components/LocaleProvider";
import { Field, TextInput, Toggle } from "@/components/admin/ui";
import type { ContactProfile } from "@/lib/contact";
export function ContactSettings({ title, value, onChange }: { title: string; value: ContactProfile; onChange: (value: ContactProfile) => void }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="text-sm font-bold text-white/70"><T>{title}</T></h2><div className="mt-4 space-y-3">
    <Field label="Email for contact & purchases"><TextInput type="email" maxLength={254} value={value.email} onChange={e => onChange({ ...value, email: e.target.value })} /></Field>
    <Toggle label="Show email in footer" checked={value.show_email} onChange={v => onChange({ ...value, show_email: v })} />
    <Toggle label="Enable collapsible contact form" checked={value.form_enabled} onChange={v => onChange({ ...value, form_enabled: v })} />
    <Toggle label="Notify the connected Telegram bot" checked={value.telegram_notifications} onChange={v => onChange({ ...value, telegram_notifications: v })} />
    {(["instagram", "telegram", "github", "discord"] as const).filter(key => title === "IT contacts" || (key !== "github" && key !== "discord")).map(key => <Field key={key} label={key === "discord" ? "Discord username" : `${key} URL`}><TextInput maxLength={500} type={key === "discord" ? "text" : "url"} value={value[key]} onChange={e => onChange({ ...value, [key]: e.target.value })} /></Field>)}
    <p className="text-xs leading-6 text-white/35"><T>Leave a social link empty to hide it. Telegram alerts use the bot and chat ID configured below.</T></p>
  </div></section>;
}
