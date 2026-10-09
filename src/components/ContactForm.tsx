"use client";
import { useId, useState, type FormEvent } from "react";
import { ChevronDown, Mail, Send } from "lucide-react";
import { T, useLocale } from "@/components/LocaleProvider";
import type { ContactProfile } from "@/lib/contact";

export function ContactForm({ area, profile, dark = false }: { area: "music" | "it"; profile: ContactProfile; dark?: boolean }) {
  const id = useId(); const { t } = useLocale();
  const [open, setOpen] = useState(false); const [pending, setPending] = useState(false); const [status, setStatus] = useState(""); const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = event.currentTarget; const values = new FormData(form); setPending(true); setStatus(""); setSent(false);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ area, name: values.get("name"), email: values.get("email"), message: values.get("message"), website: values.get("website"), consent: values.get("consent") === "on" }) });
      const result = await response.json();
      if (!response.ok) { setStatus(result.error || "Could not send. Please use email directly."); return; }
      setSent(true); setStatus("Message sent. Thank you — I will reply by email."); form.reset();
    } catch { setStatus("Could not send. Please use email directly."); } finally { setPending(false); }
  }
  if (!profile.form_enabled) return null;
  const field = `mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 ${dark ? "border-white/15 bg-white/5 text-white" : "border-black/15 bg-white text-black"}`;
  return <div className={`mt-6 w-full rounded-2xl border ${dark ? "border-white/15 bg-white/[.03]" : "border-black/10 bg-black/[.02]"}`}>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-5 text-left text-sm font-semibold"><Mail size={17} /><T>Write to me</T><ChevronDown size={17} className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`} /></button>
    <div id={id} hidden={!open} className="px-5 pb-5">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-xs leading-6 opacity-60"><T>Your message goes to my email. I reply to the address you provide.</T></p>
        <label className="block text-xs"><T>Your name</T><input name="name" autoComplete="name" required maxLength={100} className={field} disabled={pending} /></label>
        <label className="block text-xs"><T>Your email</T><input name="email" type="email" autoComplete="email" required maxLength={254} className={field} disabled={pending} /></label>
        <label className="block text-xs"><T>Message</T><textarea name="message" required minLength={10} maxLength={3000} rows={5} className={field} disabled={pending} /></label>
        <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="flex items-start gap-2 text-xs leading-5 opacity-70"><input className="mt-1" name="consent" type="checkbox" required disabled={pending} /><T>I agree to use my contact details to reply to this inquiry.</T></label>
        <button disabled={pending} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"><Send size={15} />{t(pending ? "Sending..." : "Send message")}</button>
        {status && <p role={sent ? "status" : "alert"} className={`text-sm leading-6 ${sent ? (dark ? "text-lime-200" : "text-green-700") : (dark ? "text-amber-200" : "text-red-700")}`}><T>{status}</T>{!sent && <a href={`mailto:${profile.email}`} className="mt-2 block break-all underline">{profile.email}</a>}</p>}
      </form>
    </div>
  </div>;
}
