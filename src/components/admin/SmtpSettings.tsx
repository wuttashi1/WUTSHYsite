"use client";
import { useEffect, useState } from "react";
import { T } from "@/components/LocaleProvider";
import { Button, Field, TextInput, Select, useToast } from "@/components/admin/ui";
export function SmtpSettings() {
  const { notify } = useToast(); const [busy, setBusy] = useState(false); const [loaded, setLoaded] = useState(false); const [configured, setConfigured] = useState(false); const [error, setError] = useState("");
  const [form, setForm] = useState({ host: "smtp.gmail.com", port: 465, user: "den.velikiy562381@gmail.com", from: "den.velikiy562381@gmail.com", password: "" });
  useEffect(() => { let active = true; void fetch("/api/admin/smtp").then(async response => { const result = await response.json(); if (!response.ok) throw new Error(); if (active) { if (result.configured) { setForm({ host: result.host, port: result.port, user: result.user, from: result.from, password: "" }); setConfigured(true); } setLoaded(true); } }).catch(() => { if (active) setError("SMTP settings unavailable. Check server configuration."); }); return () => { active = false; }; }, []);
  async function save() { setBusy(true); try { const response = await fetch("/api/admin/smtp", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!response.ok) throw new Error(); setConfigured(true); setForm(value => ({ ...value, password: "" })); notify("SMTP verified and saved"); } catch { notify("Could not verify or save SMTP. Check credentials and server configuration.", "error"); } finally { setBusy(false); } }
  return <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="text-sm font-bold text-white/70"><T>Email delivery / SMTP</T></h2><p className="mt-3 text-xs leading-6 text-white/45"><T>For Gmail use an app password. The password is encrypted and is never returned to the browser. Leave it blank to keep the saved password.</T></p><p className="mt-2 text-xs text-violet-300"><T>{configured ? "SMTP is configured" : "SMTP is not configured yet"}</T></p>{error && <p role="alert" className="mt-3 text-xs text-amber-200"><T>{error}</T></p>}<div className="mt-4 space-y-3">
    <Field label="SMTP server"><Select disabled={!loaded || busy} value={form.host} onChange={e => setForm({ ...form, host: e.target.value })}>{["smtp.gmail.com", "smtp.office365.com", "smtp.mail.yahoo.com", "smtp.zoho.com", "smtp.zoho.eu", "smtp.mail.me.com"].map(host => <option key={host}>{host}</option>)}</Select></Field>
    <Field label="Port"><Select disabled={!loaded || busy} value={form.port} onChange={e => setForm({ ...form, port: Number(e.target.value) })}><option value={465}>465 / TLS</option><option value={587}>587 / STARTTLS</option></Select></Field>
    <Field label="SMTP username"><TextInput disabled={!loaded || busy} type="email" value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} /></Field>
    <Field label="Sender email"><TextInput disabled={!loaded || busy} type="email" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} /></Field>
    <Field label="App password"><TextInput disabled={!loaded || busy} type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></Field>
    <Button disabled={!loaded || busy} onClick={save}><T>{busy ? "Verifying..." : "Verify and save SMTP"}</T></Button><p className="text-xs leading-6 text-white/35"><T>SMTP is saved separately. Contact recipients and Telegram notifications use the contact settings above.</T></p>
  </div></section>;
}
