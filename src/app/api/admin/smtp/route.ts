import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptSmtp, getSmtp, privateDb, validSmtp, mailTransport, type SmtpSettings } from "@/lib/contact-server";
export const runtime = "nodejs";
export const maxDuration = 60;
async function authorized() { try { return !!(await (await createClient()).auth.getUser()).data.user; } catch { return false; } }
export async function GET() {
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const smtp = await getSmtp(); return NextResponse.json(smtp ? { host: smtp.host, port: smtp.port, user: smtp.user, from: smtp.from, configured: true } : { configured: false }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "SMTP settings unavailable. Check server configuration." }, { status: 503 }); }
}
export async function PUT(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({}, { status: 403 });
  if (!await authorized()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.text(); if (body.length > 4000) return NextResponse.json({}, { status: 413 });
    const input = JSON.parse(body); const previous = input.password ? null : await getSmtp();
    const smtp: SmtpSettings = { host: input.host, port: Number(input.port), user: input.user, from: input.from, password: input.password || previous?.password || "" };
    if (!validSmtp(smtp)) return NextResponse.json({ error: "Check SMTP fields" }, { status: 400 });
    const transport = mailTransport(smtp);
    try { await transport.verify(); } finally { transport.close(); }
    const { error } = await privateDb().from("wutshy_settings").upsert({ key: "contact_smtp_encrypted", value: encryptSmtp(smtp) });
    if (error) throw new Error("Save failed");
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not verify or save SMTP. Check credentials and server configuration." }, { status: 503 }); }
}
