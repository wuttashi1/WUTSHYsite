<div align="center">

# WUTSHY · Music Portfolio

Music producer portfolio with beats, mixing, drum kits, audio previews and content management, built with Next.js and Supabase.

[Contributing](CONTRIBUTING.md) · [Branches](https://github.com/wuttashi1/WUTSHYsite/branches)

</div>

---

## Features

- `/connect`: seven development projects, interactive Telegram/Discord-style bot previews and a stylized Spatial HandGUI demo. Previews run entirely in the browser with sample data.
- Russian, Ukrainian, English and German UI with a persistent language selector. Portfolio switch buttons link the music and IT pages.
- Responsive administration, translated controls, keyboard-accessible dialogs and per-language content editing.
- Beats, drum kits and mixing portfolio pages.
- Audio previews, individual work pages and search.
- Administrative panels for content and settings.
- Supabase database, authentication and file storage.

## Run the website locally

```bash
npm ci
npm run dev:site
```

Open http://localhost:3000. `dev:site` starts the website on its own. `npm run dev` also starts the Telegram integration in `scripts/telegram-bot.mjs`.

Without Supabase the site uses sample music data. `/admin` is available as a local preview; database changes are not saved. Bot previews on `/connect` do not require Supabase, Telegram credentials, or Discord credentials.

## Portfolio and languages

- Edit project details and preview scenarios in `src/lib/showcase.ts` and the music-site card in `src/lib/projects.ts`. `musicPortfolioUrl` controls the normal return link.
- UI dictionaries use RU, UK, EN, DE order. Edit `scripts/build-translations.mjs`, `scripts/demo-translations.txt` and `scripts/translation-extras.json`, then run `npm run i18n:build`.
- Under **Admin → Site Texts**, choose the content language separately from the interface language. English is the base content. The other language versions are stored in `wutshy_settings` under `content_locales`; the existing key/value table needs no migration. Save before leaving the page. Names, source-code snippets, URLs and the requested portfolio button labels stay unchanged.
- Custom project or product descriptions need explicit translations; no machine translation service is called. New content without a translation falls back to its source text.
- `npm run check:i18n` validates all four dictionary values and all demo message translations; `npm run lint` checks the source.

## Configure Supabase

1. Create `.env.local` from `.env.local.example` and enter your project settings.
2. Review the SQL files in `supabase/` and prepare the database.
3. Configure an administrator account in Supabase Auth.
4. Restart the website and check sign-in at `/admin`.

## Production build

```bash
npm run build
npm run start:site
```

## Project layout

- `src/app/` — public pages, API routes and administration.
- `src/components/` — cards, audio player and interface components.
- `src/lib/` — configuration, data and Supabase clients.
- `supabase/` — SQL files.
- `scripts/` — supporting integrations.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Supabase.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch and contribution guidelines.

## Version 0.2 — IT portfolio and artist selections

- `/connect` is a standalone development portfolio, with RU/UK/EN/DE UI, interactive scripted bot previews, original DotaAccept and Spatial HandGUI screenshots, and repository links. The Food Planner and Fitness cards also link to the public Telegram bots documented in their repositories.
- IT contacts: GitHub `wuttashi1`, Telegram `@spirit_link`, Discord `@wutshy` (copy username; a numeric Discord ID is needed for a direct profile URL). The music return link is at the bottom only.
- In `/admin/collections`, create an artist selection, choose its address (for example `fimiquerro`), add individual works and/or tags, arrange manual picks, preview it, then enable Published and save. Share `/beats/send/fimiquerro`. Addresses are case-insensitive and fixed after creation.
- Manual picks appear first; tag matches follow catalogue order without duplicates. Choose any or all selected tags. Tag-based selections update with the catalogue. Draft/deleted selections return an unavailable page. Deleting a selection does not delete works.
- Published selections are unlisted and marked `noindex`, not password-protected: anyone with the URL can view them. Store no confidential content in these links.
- Selections use the existing production `wutshy_settings` key/value table (`artist_collection:<slug>`), with the same authenticated admin write access used by site settings. No new database migration is needed for an existing installation using that table. Supabase environment variables and existing table permissions must be configured for persistence.
- Without Supabase, the admin provides a clearly labeled sample preview; saving is disabled. The sample public `/beats/send/Fimiquerro` page exists only in development, never in production.

Validation: `npm run lint`, `npm run check:i18n`, `npm run check:collections`, `npm run build`.
