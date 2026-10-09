import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { contactProfile, parseInquiry, validEmail } from "@/lib/contact";
import { getSmtp, mailTransport, privateDb } from "@/lib/contact-server";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({}, { status: 403 });
  let input;
  try { const text = await request.text(); if (text.length > 12000) return NextResponse.json({}, { status: 413 }); input = parseInquiry(JSON.parse(text)); } catch { /* invalid input */ }
  if (!input) return NextResponse.json({ error: "Check your name, email and message" }, { status: 400 });
  try {
    const db = privateDb();
    const { data, error } = await db.from("wutshy_settings").select("key,value").in("key", ["contact", "contact_it", "telegram"]);
    if (error) throw new Error("Settings unavailable");
    const settings = Object.fromEntries((data || []).map(row => [row.key, row.value]));
    const profile = contactProfile(settings[input.area === "it" ? "contact_it" : "contact"]);
    if (!profile.form_enabled || !validEmail(profile.email)) return NextResponse.json({ error: "The form is unavailable. Please use email directly." }, { status: 503 });
    const smtp = await getSmtp();
    if (!smtp) return NextResponse.json({ error: "The form is unavailable. Please use email directly." }, { status: 503 });
    // Persist rate limits across serverless instances. Only a salted IP hash is retained, never inquiry content.
    const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    const hash = createHash("sha256").update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex").slice(0, 32);
    const bucket = Math.floor(Date.now() / 60000);
    const rateKey = `contact_rate:${bucket}:${hash}`;
    const { error: rateError } = await db.from("wutshy_settings").insert({ key: rateKey, value: { expires: bucket + 2 } });
    if (rateError) return NextResponse.json({ error: rateError.code === "23505" ? "Please wait a minute before sending again" : "The form is unavailable. Please use email directly." }, { status: rateError.code === "23505" ? 429 : 503 });
    await db.from("wutshy_settings").delete().like("key", "contact_rate:%").lt("key", `contact_rate:${bucket - 1440}:`);
    const subject = `[WUTSHY / ${input.area.toUpperCase()}] ${input.name}`;
    const text = `${subject}\nEmail: ${input.email}\n\n${input.message}`;
    const transport = mailTransport(smtp);
    try { await transport.sendMail({ from: smtp.from, to: profile.email, replyTo: input.email, subject, text }); } finally { transport.close(); }
    let telegramDelivered = false;
    const telegram = settings.telegram;
    if (profile.telegram_notifications && telegram?.enabled && telegram.bot_token && telegram.chat_id) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${telegram.bot_token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: telegram.chat_id, text, link_preview_options: { is_disabled: true } }), signal: AbortSignal.timeout(8000) });
        telegramDelivered = response.ok && (await response.json()).ok === true;
      } catch { /* Email succeeded; never ask visitor to resend a delivered message. */ }
    }
    console.info("Contact delivery", { area: input.area, email: true, telegram: telegramDelivered });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not send. Please use email directly." }, { status: 503 }); }
}
