import { test } from "node:test";
import assert from "node:assert/strict";
import { carouselOffset, homeVideos, parseYoutube } from "../src/lib/home-videos";

test("YouTube URL variants and spoofed hosts", () => {
  for (const url of ["https://youtube.com/watch?si=x&v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ?t=3", "https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://m.youtube.com/watch?v=dQw4w9WgXcQ"]) assert.equal(parseYoutube(url)?.id, "dQw4w9WgXcQ");
  assert.equal(parseYoutube("https://youtube.com/shorts/dQw4w9WgXcQ")?.portrait, true);
  for (const url of ["https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ", "javascript:alert(1)", "https://youtu.be/short", "https://evil.test/youtube.com/watch?v=dQw4w9WgXcQ"]) assert.equal(parseYoutube(url), null);
});
test("legacy video survives while an explicit empty list stays empty", () => {
  const legacy = { youtube_url: "https://youtu.be/dQw4w9WgXcQ", video_title: "Existing", enabled: true, title: "", author: "", thumbnail_url: "" };
  assert.equal(homeVideos(legacy)[0].title, "Existing");
  assert.deepEqual(homeVideos({ ...legacy, videos: [] }), []);
});
test("carousel wraps with unique positions, including one and two cards", () => {
  for (const count of [1, 2, 3, 4, 20]) for (let active = 0; active < count; active++) {
    assert.equal(carouselOffset(active, active, count), 0);
    assert.equal(new Set(Array.from({ length: count }, (_, i) => carouselOffset(i, active, count))).size, count);
  }
  assert.equal(carouselOffset(0, 4, 5), 1);
});
