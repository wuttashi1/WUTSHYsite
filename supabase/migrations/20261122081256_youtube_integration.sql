create table public.youtube_integration (
  id integer primary key check (id = 1),
  encrypted_key jsonb not null,
  catalog jsonb not null default '{"channel":"WUTSHY BEATS II","videos":[]}'::jsonb,
  synced_at timestamptz not null default now(),
  attempted_at timestamptz not null default now(),
  last_error text
);
alter table public.youtube_integration enable row level security;
revoke all on public.youtube_integration from anon, authenticated;
grant all on public.youtube_integration to service_role;
