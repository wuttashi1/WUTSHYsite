# WUTSHY Portfolio

Music production portfolio site for **WUTSHY** — beats, mixing, drum kits.

Inspired by modern producer marketplace design with smooth animations and hover click sounds.

## Features

- **Portfolio pages**: Beats, Mixing, Drum Kits, Placements
- **Audio previews** with built-in player
- **Spotify embeds** for tracks and playlists
- **Smooth animations** via Framer Motion
- **Hover click sounds** on interactive elements
- **Admin panel** at `/admin` for full content management
- **Supabase backend** for database, auth, and file storage

## Quick Start (Demo Mode)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The site works out of the box with demo data. Admin panel demo login: `admin` / `wutshy`

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Run the SQL from `supabase/schema.sql` in the Supabase SQL Editor
4. Create an admin user in Supabase Auth (Authentication → Users → Add user)
5. Restart the dev server

## Admin Panel

Navigate to `/admin` to manage:

- **Works** — beats, mixing portfolio, placements (with audio, Spotify links, cover images)
- **Drum Kits** — kits with pricing, tracklists, and audio previews
- **Settings** — hero text and social links

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Supabase (PostgreSQL, Auth, Storage)

## Project Structure

```
src/
├── app/              # Pages (public + admin)
├── components/       # UI components
├── hooks/            # useHoverSound
├── lib/              # Supabase clients, queries, demo data
└── types/            # TypeScript interfaces
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy
