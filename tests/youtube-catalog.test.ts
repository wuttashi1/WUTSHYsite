import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { fetchYoutubeCatalog } from "../src/lib/youtube-catalog";

test("loads every page, deduplicates and omits non-public uploads", async () => {
  const calls: string[] = [];
  const item = (id: string, privacyStatus = "public") => ({ snippet: { title: id, resourceId: { videoId: id } }, status: { privacyStatus } });
  const catalog = await fetchYoutubeCatalog(async (resource, params) => {
    calls.push(resource + (params.pageToken || ""));
    if (resource === "channels") return { items: [{ snippet: { title: "Channel" }, contentDetails: { relatedPlaylists: { uploads: "uploads" } } }] };
    return params.pageToken ? { items: [item("aaaaaaaaaaa"), item("bbbbbbbbbbb"), item("ccccccccccc", "private")] } : { items: [item("aaaaaaaaaaa")], nextPageToken: "second" };
  });
  assert.deepEqual(catalog.videos.map(v => v.id), ["aaaaaaaaaaa", "bbbbbbbbbbb"]);
  assert.deepEqual(calls, ["channels", "playlistItems", "playlistItemssecond"]);
});
test("does not return a partial catalog when a later page fails", async () => {
  await assert.rejects(fetchYoutubeCatalog(async (resource, params) => {
    if (resource === "channels") return { items: [{ contentDetails: { relatedPlaylists: { uploads: "uploads" } } }] };
    if (params.pageToken) throw new Error("quota");
    return { items: [], nextPageToken: "next" };
  }), /quota/);
});
test("YouTube credentials are inaccessible to anonymous and ordinary signed-in roles", async () => {
  const pg = new PGlite();
  try {
    await pg.exec("create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;");
    await pg.exec(await readFile("supabase/migrations/20261122081256_youtube_integration.sql", "utf8"));
    await pg.exec("set role service_role; insert into public.youtube_integration(id,encrypted_key) values(1,'{}'); reset role;");
    for (const role of ["anon", "authenticated"]) {
      await pg.exec(`set role ${role}`);
      await assert.rejects(pg.query("select * from public.youtube_integration"));
      await assert.rejects(pg.exec("update public.youtube_integration set encrypted_key='{}'"));
      await pg.exec("reset role");
    }
  } finally { await pg.close(); }
});
