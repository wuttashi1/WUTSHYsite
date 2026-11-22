"use client";
import { useEffect, useState } from "react";
import { Button, Field, TextInput } from "./ui";

interface Status { configured: boolean; channel?: string; count: number; syncedAt?: string; error?: string; }
export function YoutubeSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function load() {
    const response = await fetch("/api/admin/youtube", { cache: "no-store" });
    if (!response.ok) throw new Error("Не удалось загрузить настройки. Обнови страницу или войди в админку заново.");
    setStatus(await response.json());
  }
  useEffect(() => { void load().catch(e => { setFailed(true); setMessage(e.message); }); }, []);
  async function submit(refresh = false) {
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const response = await fetch("/api/admin/youtube", { method: refresh ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, ...(refresh ? {} : { body: JSON.stringify({ key }) }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error === "YouTube quota exceeded" ? "Лимит YouTube API исчерпан. Дождись обновления квоты в Google Cloud. Сохранённые видео остаются на сайте." : "Не удалось подключиться. Проверь ключ, включение YouTube Data API v3 и ограничения ключа по инструкции ниже. Старый ключ и каталог сохранены.");
      if (!refresh) setKey("");
      await load();
      setMessage(refresh ? "Каталог проверен. Между обновлениями вручную — минимум одна минута." : `Подключено! В каталоге ${result.count} видео. Они уже доступны во вкладке YT Beats.`);
    } catch (e) { setFailed(true); setMessage(e instanceof Error ? e.message : "Ошибка подключения"); }
    finally { setBusy(false); }
  }
  return <div className="max-w-3xl space-y-6 p-6 md:p-8">
    <div><h1 className="text-2xl font-bold">YouTube / YT Beats</h1><p className="mt-2 text-sm leading-6 text-white/50">Подключи канал один раз — новые публичные видео будут появляться в разделе «Биты → YT Beats» автоматически.</p></div>
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <h2 className="font-semibold">1. Твой канал</h2>
      <a className="block break-all text-sm text-lime-200 underline" href="https://www.youtube.com/channel/UCcr6zSvEL26HgESSGnkUhrw" target="_blank" rel="noopener noreferrer">WUTSHY BEATS II</a>
      <p className="text-sm text-white/50">Канал уже выбран. Загружать ролики или вставлять ссылки по одному не нужно.</p>
      <div className="rounded-xl bg-white/5 p-4 text-sm" aria-live="polite">{status ? status.configured ? <><strong className="text-lime-200">Подключено · {status.channel}</strong><p className="mt-2">Видео: {status.count}</p><p className="mt-1 text-white/50">Последнее обновление: {status.syncedAt ? new Date(status.syncedAt).toLocaleString("ru-RU") : "—"}</p>{status.error && <p className="mt-2 text-amber-200">Последнее обновление не удалось. На сайте показывается сохранённый каталог. Проверь квоту и ключ.</p>}</> : "Ожидает подключения ключа" : "Загружаю настройки…"}</div>
    </section>
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <h2 className="font-semibold">2. Подключение</h2>
      <Field label="YouTube Data API key"><TextInput type="password" autoComplete="new-password" spellCheck={false} value={key} onChange={e => setKey(e.target.value)} disabled={busy || !status} placeholder={status?.configured ? "Новый ключ — только если хочешь заменить текущий" : "Вставь API key из Google Cloud"} /></Field>
      <p className="text-sm leading-6 text-white/50">Ключ сохраняется зашифрованным и больше не отображается. Оставь поле пустым, если не меняешь ключ. Сохранение происходит отдельно от остальных настроек сайта.</p>
      <div className="flex flex-wrap gap-3"><Button onClick={() => submit()} disabled={busy || !key.trim() || !status}>{busy ? "Проверяю и загружаю…" : status?.configured ? "Проверить и заменить ключ" : "Проверить и подключить"}</Button><Button variant="ghost" onClick={() => submit(true)} disabled={busy || !status?.configured}>Обновить видео сейчас</Button></div>
      {message && <p role={failed ? "alert" : "status"} className={`rounded-xl p-3 text-sm leading-6 ${failed ? "bg-red-500/10 text-red-200" : "bg-lime-400/10 text-lime-200"}`}>{message}</p>}
      <a href="/beats/youtube" target="_blank" rel="noopener noreferrer" className="inline-block text-sm underline text-white/70">Открыть YT Beats на сайте</a>
    </section>
    <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <h2 className="text-lg font-semibold">3. Как получить ключ — пошагово</h2>
      <ol className="mt-5 list-decimal space-y-5 pl-5 text-sm leading-6 text-white/70">
        <li>Открой <a className="text-lime-200 underline" href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> и войди в свой Google-аккаунт. Создай проект, например <strong>WUTSHY Website</strong>, и выбери его в верхней панели.</li>
        <li>Перейди в <a className="text-lime-200 underline" href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer">YouTube Data API v3</a>. Убедись, что выбран нужный проект, и нажми <strong>Enable / Включить</strong>.</li>
        <li>Открой <a className="text-lime-200 underline" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">APIs & Services → Credentials / Учётные данные</a>. Нажми <strong>Create credentials → API key / Создать учётные данные → Ключ API</strong>. OAuth и сервисный аккаунт для публичных роликов не нужны.</li>
        <li>Открой настройки созданного ключа. В <strong>API restrictions / Ограничения API</strong> выбери <strong>Restrict key / Ограничить ключ</strong> и оставь только <strong>YouTube Data API v3</strong>. Нажми Save.</li>
        <li>В <strong>Application restrictions / Ограничения приложений</strong> не выбирай Websites: запросы делает сервер Vercel, а не браузер. Для текущего проекта без фиксированного исходящего IP выбери <strong>None</strong>, сохранив ограничение API из предыдущего шага. Если позднее подключишь постоянный IP сервера, можно ограничить ключ этим IP.</li>
        <li>Скопируй ключ, вставь в поле выше и нажми <strong>«Проверить и подключить»</strong>. Дождись зелёного статуса и количества видео. Если ограничения только что изменены, дай Google несколько минут и повтори проверку.</li>
      </ol>
      <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm leading-6 text-white/50"><p><strong className="text-white/80">Что происходит дальше:</strong> при посещении YT Beats сайт проверяет каталог не чаще одного раза в 15 минут. Кнопка обновления запускает проверку вручную. Загружаются все страницы списка, а не только последние 15 или 50 роликов. На странице видео открываются порциями по 24.</p><p><strong className="text-white/80">Что попадёт на сайт:</strong> публичные видео канала. Приватные, удалённые и недоступные через API ролики не выводятся. Если автор запретил встраивание, видео можно открыть на YouTube.</p><p><strong className="text-white/80">Если возникла ошибка:</strong> проверь, что API включён в том же проекте, где создан ключ, что разрешён именно YouTube Data API v3 и не установлено ограничение Websites. При исчерпании квоты дождись её восстановления. Последний успешно загруженный каталог сохраняется.</p><p>Официальная справка: <a className="underline" href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener noreferrer">подключение YouTube API</a> · <a className="underline" href="https://cloud.google.com/api-keys/docs/add-restrictions-api-keys" target="_blank" rel="noopener noreferrer">ограничения ключей</a>.</p></div>
    </section>
  </div>;
}
