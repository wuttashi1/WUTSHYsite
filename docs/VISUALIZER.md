# WUTSHY Visualizer

## Implementation

Routes: `/visualizer`, `/visualizer/login`, `/visualizer/editor`, `/visualizer/projects`, and `/admin/visualizer/{users,access,presets}`. The existing Next.js application, Supabase accounts and site design are reused. No payment system is added.

Ten independent deterministic Canvas renderers, a live gallery, local audio decoding/analysis in a worker, four MIDI layers, tempo-map-aware MIDI import, piano-roll editing, local transcription, editable presets and IndexedDB projects are implemented. MP4 export uses timestamped WebCodecs H.264/AAC via Mediabunny; WebM is an explicit fallback. Audio never uploads to the site. Original audio is the exported soundtrack; MIDI drives visuals rather than synthesizing sound.

Access is checked on the server for protected pages and APIs, and rechecked during imports/playback/exports. Browser rendering code is necessarily downloadable. Permanent/temporary grants, expiration, suspension, revocation and an atomic audit log are implemented. User modifications do not overwrite built-in presets.

## Changed files

- `src/lib/visualizer/`: authorization, DSP/worker, MIDI, rendering, encoding, preset schema and persistence.
- `src/components/visualizer/`: editor, piano roll, auth, gallery, projects and admin interface.
- `src/app/visualizer/`, `src/app/admin/visualizer/`, `src/app/api/visualizer/`: routes.
- Navbar, Footer, PlayerBar, AdminSidebar: integration into the existing site.
- Existing Supabase middleware and SMTP admin endpoint: administrator-role enforcement.
- `supabase/migrations/20261009_visualizer.sql`: database and permissions.
- `tests/visualizer*.ts`: focused tests; `scripts/verify-visualizer-export.mjs`: browser encoder fixture.

## Required setup before public registration or deployment

1. Back up the existing Supabase database and review/run `supabase/migrations/20261009_visualizer.sql` once in SQL Editor. It runs transactionally and aborts unless the existing verified owner `den.velikiy562381@gmail.com` exists. If the actual owner account differs, deliberately adjust the bootstrap SELECT before applying it.
2. The migration creates administrator membership, access, preset, audit and rate-limit tables. Existing content/media are not deleted. Restrictive guards prevent ordinary registered users from writing existing site content, settings and storage. New users receive PENDING access. Additional trusted administrators must be added through SQL using their existing user UUIDs.
3. Review any additional custom tables/policies in the live project before enabling signups; the migration covers this repository's tables.
4. Set `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Keep the service key server-only and out of Git. Configure the same variables on Vercel.
5. In Supabase Auth configure the Site URL and allowed redirects for `/visualizer/auth` on localhost, 127.0.0.1 and the production domain. Recovery uses that callback with `?reset=1`.
6. Configure email verification, recovery mail and authentication rate limits in Supabase Auth. Contact-form SMTP does not configure Supabase Auth mail. Existing SSR/browser sessions are reused; this is not a separate HTTP-only session implementation. Client password fields require at least 12 characters; enforce your password policy in Supabase too.
7. Register a test account, approve it from `/admin/visualizer/access`, then verify suspension and expiration with that account. Do not deploy public registration before the migration.

## Install and local development

```sh
npm ci
npm run dev:site
```

Open `http://localhost:3000/visualizer`. Without Supabase, the landing/gallery is available but protected functionality stays locked; there is no authorization bypass in the application.

```sh
npm run test:visualizer
npm run lint
npm run build
npm run start:site
```

For an actual browser encoder check run `npm run test:visualizer:export` and open `http://127.0.0.1:3001`. This standalone test harness uses generated audio and the same export function, then decodes its output. It does not access the protected editor and is not part of application routes. Results and MP4 are stored in ignored `.visualizer-test/`. Stop the test server when finished.

## Verified

- Production build, TypeScript and ESLint passed.
- 16 focused tests: access states, MIDI tempo changes/roundtrip, offsets/repeats, pitch fixture, ten distinct animated deterministic renderers, and a Postgres-compatible migration/RLS/audit fixture.
- Actual browser MP4 at 1920×1080/30: 30 decoded frames, H.264/AAC, 1.0027 seconds, audio/video start at zero. The test tone at 0.75 seconds appears at 0.2733 seconds after trimming from 0.5 seconds. Output: 101,738 bytes.
- Real Supabase login/approval/recovery and manual editor interaction remain unverified until database access is configured.

## Deployment

Retain the existing GitHub-to-Vercel integration. Apply the migration and configure Auth/environment first, then build and push reviewed changes. This visualizer task has not been pushed or deployed because live database setup remains outstanding. Do not remove restrictive policies to work around missing administrator membership.

## Limits

- Audio: 150 MB / 10 minutes. Export: 5 minutes; large in-memory exports may need shorter clips on low-memory devices. Codec availability depends on the browser. Only the stated 1080p/30 MP4 fixture was actually verified here.
- MIDI Type 0/1 with PPQ timing; Type 2/SMPTE returns an error. Four layers, 50,000 imported notes. Piano-roll visible pitches: 24–96; other notes remain in exported data. Edited MIDI uses constant tempo preserving absolute note times rather than the original tempo-event map.
- Transcription is approximate. Experimental polyphony detects spectral peaks, not separated instruments. Basic Pitch and an optional self-hosted neural service are not integrated.
- Local projects do not sync across devices. Clearing browser storage removes projects/media. Missing media requires reimporting the original file.
- Administrator listing currently shows at most 1,000 accounts. Built-ins remain available; administrator disable/delete applies to custom published presets.
- The new workspace is English. Existing RU/UK/EN/DE site localization is preserved.
- The development-only ESLint dependency chain reports an upstream braces advisory. No forced framework downgrade was applied.

## Connection status (2026-10-09)
Connected local .env.local to Supabase project avawpppfzftghdyaqyfc. Applied visualizer_access_and_presets and visualizer_explicit_function_privileges migrations. Owner membership initialized. Local access endpoint returns ready:true; anonymous requests remain 401. Server key remains unset: Vercel production Secret values cannot be exported. Add SUPABASE_SERVICE_ROLE_KEY locally to enable service-role admin actions. No site deployment performed.

Server key configured locally and verified through Supabase Auth admin API and administrator membership query. Secret is stored only in ignored .env.local.
