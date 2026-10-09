import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { validEmail } from "./contact";

export const SMTP_HOSTS = ["smtp.gmail.com", "smtp.office365.com", "smtp.mail.yahoo.com", "smtp.zoho.com", "smtp.zoho.eu", "smtp.mail.me.com"];
export interface SmtpSettings { host: string; port: number; user: string; password: string; from: string; }
export function privateDb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !process.env.NEXT_PUBLIC_SUPABASE_URL || key.startsWith("your_")) throw new Error("Server configuration missing");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function encryptionKey() {
  const secret = process.env.CONTACT_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.startsWith("your_")) throw new Error("Server configuration missing");
  return createHash("sha256").update(secret).digest();
}
export function encryptSmtp(value: SmtpSettings) {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return { version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: encrypted.toString("base64") };
}
export async function getSmtp(): Promise<SmtpSettings | null> {
  const { data, error } = await privateDb().from("wutshy_settings").select("value").eq("key", "contact_smtp_encrypted").maybeSingle();
  if (error) throw new Error("Settings unavailable");
  if (!data) return null;
  const v = data.value; const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(v.iv, "base64"));
  decipher.setAuthTag(Buffer.from(v.tag, "base64"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(v.data, "base64")), decipher.final()]).toString("utf8"));
}
export function validSmtp(v: SmtpSettings) {
  return SMTP_HOSTS.includes(v.host) && [465, 587].includes(v.port) && validEmail(v.user) && validEmail(v.from) && typeof v.password === "string" && v.password.length > 0 && v.password.length <= 512;
}
export function mailTransport(smtp: SmtpSettings) {
  return nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, requireTLS: true,
    auth: { user: smtp.user, pass: smtp.password }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000 });
}
