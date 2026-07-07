/**
 * WUTSHY Telegram Bot
 * Uploads beats/mixes to the site via Telegram.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "[bot] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  console.error("[bot] Get service role key from Supabase Dashboard → Settings → API");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

let botToken = "";
let allowedChatId = "";
let enabled = false;
let offset = 0;

/** @type {Map<number, { step: string; type?: string; audioUrl?: string; coverUrl?: string; title?: string }>} */
const sessions = new Map();

async function loadSettings() {
  const { data } = await supabase.from("wutshy_settings").select("*").eq("key", "telegram");
  if (data?.[0]?.value) {
    const t = data[0].value;
    botToken = t.bot_token || "";
    allowedChatId = String(t.chat_id || "");
    enabled = !!t.enabled;
  }
}

async function tg(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function send(chatId, text, extra = {}) {
  return tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });
}

async function downloadTelegramFile(fileId) {
  const fileRes = await tg("getFile", { file_id: fileId });
  if (!fileRes.ok) throw new Error("getFile failed");
  const filePath = fileRes.result.file_path;
  const url = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("download failed");
  return { buffer: Buffer.from(await res.arrayBuffer()), ext: filePath.split(".").pop() || "bin" };
}

async function uploadToStorage(buffer, folder, ext) {
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, buffer, {
    upsert: true,
    contentType: ext === "mp3" ? "audio/mpeg" : undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

async function saveWork(type, title, audioUrl, coverUrl) {
  const { data, error } = await supabase
    .from("works")
    .insert({
      type,
      title,
      audio_url: audioUrl,
      cover_url: coverUrl || null,
      tags: [],
      is_featured: false,
      sort_order: 0,
    })
    .select("id, title")
    .single();
  if (error) throw error;
  return data;
}

async function listWorks() {
  const { data } = await supabase
    .from("works")
    .select("id, title, type, created_at")
    .order("created_at", { ascending: false })
    .limit(15);
  return data || [];
}

async function deleteWork(id) {
  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw error;
}

async function deleteKit(id) {
  const { error } = await supabase.from("drum_kits").delete().eq("id", id);
  if (error) throw error;
}

async function deleteTrack(id) {
  const { error } = await supabase.from("drum_kit_tracks").delete().eq("id", id);
  if (error) throw error;
}

function isAuthorized(chatId) {
  return String(chatId) === allowedChatId;
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  if (!isAuthorized(chatId)) {
    await send(chatId, "⛔ Unauthorized. Your chat ID: <code>" + chatId + "</code>");
    return;
  }

  const session = sessions.get(chatId) || { step: "idle" };
  const text = msg.text?.trim() || "";
  const caption = msg.caption?.trim() || "";

  // Commands
  if (text.startsWith("/")) {
    const [cmd, ...args] = text.split(" ");
    const arg = args.join(" ").trim();

    switch (cmd.split("@")[0]) {
      case "/start":
        sessions.set(chatId, { step: "idle" });
        await send(
          chatId,
          "🎵 <b>WUTSHY Bot</b>\n\n" +
            "/addbeat — upload beat\n" +
            "/addmix — upload mix\n" +
            "/list — recent works\n" +
            "/delete &lt;id&gt; — delete work\n" +
            "/deletetrack &lt;id&gt; — delete kit track\n" +
            "/deletekit &lt;id&gt; — delete drum kit\n" +
            "/cancel — cancel upload"
        );
        return;

      case "/cancel":
        sessions.set(chatId, { step: "idle" });
        await send(chatId, "Cancelled.");
        return;

      case "/addbeat":
        sessions.set(chatId, { step: "await_audio", type: "beat" });
        await send(chatId, "🎧 Send me an <b>audio file</b> for the beat.");
        return;

      case "/addmix":
        sessions.set(chatId, { step: "await_audio", type: "mixing" });
        await send(chatId, "🎧 Send me the <b>mixed audio</b> (after version).");
        return;

      case "/list": {
        const works = await listWorks();
        if (!works.length) {
          await send(chatId, "No works yet.");
          return;
        }
        const lines = works.map(
          (w) => `• <code>${w.id.slice(0, 8)}</code> [${w.type}] ${w.title}`
        );
        await send(chatId, "<b>Recent works:</b>\n\n" + lines.join("\n"));
        return;
      }

      case "/delete":
        if (!arg) {
          await send(chatId, "Usage: /delete &lt;work-id&gt;");
          return;
        }
        try {
          const works = await listWorks();
          const match = works.find((w) => w.id.startsWith(arg) || w.id === arg);
          if (!match) {
            await send(chatId, "Work not found.");
            return;
          }
          await deleteWork(match.id);
          await send(chatId, `🗑 Deleted: <b>${match.title}</b>`);
        } catch (e) {
          await send(chatId, "Error: " + e.message);
        }
        return;

      case "/deletetrack":
        if (!arg) {
          await send(chatId, "Usage: /deletetrack &lt;track-id&gt;");
          return;
        }
        try {
          await deleteTrack(arg);
          await send(chatId, "🗑 Track deleted.");
        } catch (e) {
          await send(chatId, "Error: " + e.message);
        }
        return;

      case "/deletekit":
        if (!arg) {
          await send(chatId, "Usage: /deletekit &lt;kit-id&gt;");
          return;
        }
        try {
          await deleteKit(arg);
          await send(chatId, "🗑 Drum kit deleted.");
        } catch (e) {
          await send(chatId, "Error: " + e.message);
        }
        return;
    }
  }

  // Upload flow
  if (session.step === "await_audio") {
    const audio = msg.audio || msg.document;
    if (!audio) {
      await send(chatId, "Please send an audio file.");
      return;
    }
    try {
      await send(chatId, "⏳ Uploading audio...");
      const { buffer, ext } = await downloadTelegramFile(audio.file_id);
      const url = await uploadToStorage(buffer, "audio", ext);
      sessions.set(chatId, {
        ...session,
        step: "await_title",
        audioUrl: url,
      });
      const defaultTitle = audio.file_name?.replace(/\.[^.]+$/, "") || "untitled";
      await send(
        chatId,
        `✅ Audio uploaded.\n\nNow send the <b>title</b>.\nOr send a <b>photo</b> as cover first.\n\nDefault: <i>${defaultTitle}</i>`
      );
    } catch (e) {
      await send(chatId, "Upload failed: " + e.message);
    }
    return;
  }

  if (session.step === "await_title") {
    // Photo as cover
    if (msg.photo) {
      try {
        const photo = msg.photo[msg.photo.length - 1];
        const { buffer, ext } = await downloadTelegramFile(photo.file_id);
        const url = await uploadToStorage(buffer, "covers", ext);
        sessions.set(chatId, { ...session, coverUrl: url });
        await send(chatId, "📸 Cover saved. Now send the <b>title</b>.");
      } catch (e) {
        await send(chatId, "Cover upload failed: " + e.message);
      }
      return;
    }

    const title = text || caption;
    if (!title) {
      await send(chatId, "Send a title as text.");
      return;
    }

    try {
      const work = await saveWork(session.type, title, session.audioUrl, session.coverUrl);
      sessions.set(chatId, { step: "idle" });
      await send(
        chatId,
        `✅ <b>${work.title}</b> published!\nType: ${session.type}\nID: <code>${work.id.slice(0, 8)}</code>`
      );
    } catch (e) {
      await send(chatId, "Save failed: " + e.message);
    }
    return;
  }

  // Default help
  if (text) {
    await send(chatId, "Use /start to see commands.");
  }
}

async function poll() {
  await loadSettings();

  if (!enabled || !botToken) {
    return; // silently skip when disabled
  }

  try {
    const res = await tg("getUpdates", { offset, timeout: 30 });
    if (!res.ok) {
      console.error("[bot] getUpdates error:", res.description);
      return;
    }

    for (const update of res.result || []) {
      offset = update.update_id + 1;
      if (update.message) {
        try {
          await handleMessage(update.message);
        } catch (e) {
          console.error("[bot] handle error:", e);
        }
      }
    }
  } catch (e) {
    console.error("[bot] poll error:", e);
  }
}

async function main() {
  console.log("[bot] WUTSHY Telegram bot starting...");
  await loadSettings();

  if (!enabled) {
    console.log("[bot] Bot disabled in settings. Enable in admin panel → Settings.");
    console.log("[bot] Waiting for settings change (polling every 30s)...");
  } else if (!botToken) {
    console.log("[bot] No bot token configured. Set in admin panel → Settings.");
  } else {
    console.log("[bot] Bot active. Authorized chat:", allowedChatId || "(not set)");
    // Clear webhook for long polling
    await tg("deleteWebhook", {});
  }

  // Reload settings every 30s, poll continuously
  setInterval(loadSettings, 30000);

  while (true) {
    await poll();
    if (!enabled || !botToken) {
      await new Promise((r) => setTimeout(r, 30000));
    }
  }
}

main().catch(console.error);
