<div align="center">

# WUTSHY · Music Portfolio

Music producer portfolio with beats, mixing, drum kits, audio previews and content management, built with Next.js and Supabase.

[Contributing](CONTRIBUTING.md) · [Branches](https://github.com/wuttashi1/WUTSHYsite/branches)

</div>

---

## Features

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
