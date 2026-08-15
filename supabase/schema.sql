-- ============================================================================
-- Nepal Cricket Hub — Supabase PostgreSQL schema
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================================
-- USERS & ADMINS
-- ============================================================================

create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text,
  avatar_url  text,
  role        text not null default 'subscriber'
              check (role in ('subscriber','admin','editor')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.admins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- NEWS
-- ============================================================================

create table if not exists public.news_sources (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  url           text not null unique,
  type          text not null default 'rss' check (type in ('rss','api','json')),
  category      text not null default 'Nepal Cricket',
  enabled       boolean not null default true,
  last_fetched  timestamptz,
  last_status   text,
  created_at    timestamptz not null default now()
);

create table if not exists public.news (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  summary        text,                          -- permitted short excerpt only
  content        text,                          -- our own editorial content (optional)
  category       text not null default 'Nepal Cricket',
  tags           text[] not null default '{}',
  image_url      text,
  source_name    text,
  source_url     text,                          -- link to original article
  original_guid  text,                          -- dedupe key (RSS guid / api id)
  is_breaking    boolean not null default false,
  is_featured    boolean not null default false,
  published_at   timestamptz,
  status         text not null default 'published' check (status in ('draft','published','archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (source_url, original_guid)
);

create index if not exists idx_news_category       on public.news (category);
create index if not exists idx_news_status_pub     on public.news (status, published_at desc);
create index if not exists idx_news_slug           on public.news (slug);
create index if not exists idx_news_breaking       on public.news (is_breaking) where is_breaking = true;
create index if not exists idx_news_guid           on public.news (original_guid) where original_guid is not null;

-- ============================================================================
-- TEAMS
-- ============================================================================

create table if not exists public.teams (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  short_name     text not null,
  slug           text not null unique,
  country        text not null default 'Nepal',
  team_type      text not null default 'International'
                 check (team_type in ('International','Domestic','NPL','Womens','U19','U16','Other')),
  logo_url       text,
  color_primary  text,
  color_secondary text,
  is_national    boolean not null default false,
  external_id    text unique,                   -- id from upstream cricket API
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================================
-- SERIES / TOURNAMENTS
-- ============================================================================

create table if not exists public.series (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  type          text not null default 'International' check (type in ('International','Domestic','NPL','Womens','U19','T20 League','ODI','Test','Other')),
  category      text not null default 'International',
  start_date    date,
  end_date      date,
  season        text,
  status        text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  points_table_available boolean not null default false,
  external_id   text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.tournaments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  series_id     uuid references public.series(id) on delete set null,
  description   text,
  logo_url      text,
  status        text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- MATCHES
-- ============================================================================

create table if not exists public.matches (
  id             uuid primary key default gen_random_uuid(),
  external_id    text unique,                   -- upstream api match id
  series_id      uuid references public.series(id) on delete cascade,
  tournament_id  uuid references public.tournaments(id) on delete set null,
  home_team_id   uuid references public.teams(id) on delete cascade,
  away_team_id   uuid references public.teams(id) on delete cascade,
  name           text,                          -- e.g. "Nepal vs UAE"
  slug           text unique,
  match_type     text not null default 'T20' check (match_type in ('Test','ODI','T20','T10','Other')),
  venue          text,
  city           text,
  country        text,
  start_time     timestamptz,                   -- scheduled start
  status         text not null default 'upcoming' check (status in ('upcoming','live','completed','abandoned','cancelled')),
  match_state    text,                          -- human status e.g. "Day 2 — Tea Break"
  result         text,                          -- "Nepal won by 4 wickets"
  toss_winner    text,
  toss_decision  text check (toss_decision in ('bat','bowl',null)),
  current_innings integer default 0,
  is_live        boolean not null default false,
  is_women       boolean not null default false,
  is_u19         boolean not null default false,
  home_score     text,                          -- "145/4 (17.2)"
  away_score     text,
  last_synced_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (home_team_id, away_team_id, start_time, series_id)
);

create index if not exists idx_matches_status      on public.matches (status);
create index if not exists idx_matches_start       on public.matches (start_time desc);
create index if not exists idx_matches_series      on public.matches (series_id);
create index if not exists idx_matches_live        on public.matches (is_live) where is_live = true;

-- ============================================================================
-- MATCH DATA
-- ============================================================================

create table if not exists public.match_scores (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  innings_number integer not null,
  team_id        uuid references public.teams(id) on delete cascade,
  batting_team   text,
  runs           integer not null default 0,
  wickets        integer not null default 0,
  overs          numeric(5,1) not null default 0,
  run_rate       numeric(6,2) not null default 0,
  target         integer,
  is_completed   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (match_id, innings_number)
);

create table if not exists public.innings (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  innings_number integer not null,
  team_id        uuid references public.teams(id) on delete cascade,
  batting_team   text,
  runs           integer not null default 0,
  wickets        integer not null default 0,
  overs          numeric(5,1) not null default 0,
  run_rate       numeric(6,2) not null default 0,
  declared       boolean not null default false,
  extra         integer not null default 0,
  created_at     timestamptz not null default now(),
  unique (match_id, innings_number)
);

create table if not exists public.batting_cards (
  id             uuid primary key default gen_random_uuid(),
  innings_id     uuid not null references public.innings(id) on delete cascade,
  player_id      uuid references public.players(id) on delete cascade,
  player_name    text not null,
  runs           integer not null default 0,
  balls          integer not null default 0,
  fours          integer not null default 0,
  sixes          integer not null default 0,
  strike_rate    numeric(6,2) not null default 0,
  dismissal      text,                          -- "c K. Airee b S. Lamichhane"
  is_not_out      boolean not null default false,
  is_out          boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.bowling_cards (
  id             uuid primary key default gen_random_uuid(),
  innings_id     uuid not null references public.innings(id) on delete cascade,
  player_id      uuid references public.players(id) on delete cascade,
  player_name    text not null,
  overs          numeric(5,1) not null default 0,
  maidens        integer not null default 0,
  runs           integer not null default 0,
  wickets        integer not null default 0,
  economy        numeric(6,2) not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.fall_of_wickets (
  id             uuid primary key default gen_random_uuid(),
  innings_id     uuid not null references public.innings(id) on delete cascade,
  wicket_number  integer not null,
  runs           integer not null,
  over           numeric(5,1) not null,
  player_name    text,
  created_at     timestamptz not null default now(),
  unique (innings_id, wicket_number)
);

create table if not exists public.partnerships (
  id             uuid primary key default gen_random_uuid(),
  innings_id     uuid not null references public.innings(id) on delete cascade,
  player_a       text,
  player_b       text,
  runs           integer not null default 0,
  balls          integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.ball_by_ball (
  id             uuid primary key default gen_random_uuid(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  innings_number integer not null,
  over           integer not null,
  ball_in_over   integer not null,
  batsman        text,
  bowler         text,
  runs           integer not null default 0,
  extra_runs     integer not null default 0,
  is_wicket      boolean not null default false,
  wicket_desc    text,
  commentary     text,
  created_at     timestamptz not null default now(),
  unique (match_id, innings_number, over, ball_in_over)
);

create index if not exists idx_bbb_match   on public.ball_by_ball (match_id, innings_number, over, ball_in_over);
create index if not exists idx_innings     on public.innings (match_id, innings_number);

-- ============================================================================
-- PLAYERS
-- ============================================================================

create table if not exists public.players (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  full_name       text,
  photo_url       text,
  country         text not null default 'Nepal',
  role            text not null default 'Batter' check (role in ('Batter','Bowler','All-rounder','Wicketkeeper','Wicketkeeper-Batter','Other')),
  batting_style   text,
  bowling_style   text,
  team_id         uuid references public.teams(id) on delete set null,
  is_nepal        boolean not null default true,
  is_nepal_women  boolean not null default false,
  is_u19          boolean not null default false,
  is_retired      boolean not null default false,
  bio             text,
  external_id     text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_players_nepal on public.players (is_nepal) where is_nepal = true;

create table if not exists public.player_statistics (
  id              uuid primary key default gen_random_uuid(),
  player_id       uuid not null references public.players(id) on delete cascade,
  format          text not null default 'T20' check (format in ('Test','ODI','T20','T20I','ODIWC','All')),
  matches         integer not null default 0,
  innings         integer not null default 0,
  runs            integer not null default 0,
  balls_faced     integer not null default 0,
  high_score      integer not null default 0,
  high_score_nout boolean not null default false,
  average         numeric(6,2) not null default 0,
  strike_rate     numeric(6,2) not null default 0,
  hundreds        integer not null default 0,
  fifties         integer not null default 0,
  fours           integer not null default 0,
  sixes           integer not null default 0,
  wickets         integer not null default 0,
  balls_bowled    integer not null default 0,
  runs_conceded   integer not null default 0,
  best_bowling_wickets integer not null default 0,
  best_bowling_runs    integer not null default 0,
  economy         numeric(6,2) not null default 0,
  average_bowling numeric(6,2) not null default 0,
  five_wickets    integer not null default 0,
  catches         integer not null default 0,
  updated_at      timestamptz not null default now(),
  unique (player_id, format)
);

create table if not exists public.player_recent_performances (
  id             uuid primary key default gen_random_uuid(),
  player_id      uuid not null references public.players(id) on delete cascade,
  match_id       uuid references public.matches(id) on delete cascade,
  match_label    text,
  date           date,
  runs           integer,
  balls          integer,
  wickets        integer,
  economy        numeric(6,2),
  is_not_out     boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists public.player_teams (
  player_id  uuid not null references public.players(id) on delete cascade,
  team_id    uuid not null references public.teams(id) on delete cascade,
  primary key (player_id, team_id)
);

-- ============================================================================
-- POINTS TABLE
-- ============================================================================

create table if not exists public.points_table (
  id            uuid primary key default gen_random_uuid(),
  series_id     uuid not null references public.series(id) on delete cascade,
  team_id       uuid not null references public.teams(id) on delete cascade,
  matches       integer not null default 0,
  wins          integer not null default 0,
  losses        integer not null default 0,
  no_result     integer not null default 0,
  ties          integer not null default 0,
  points        numeric(6,1) not null default 0,
  net_run_rate  numeric(8,3) not null default 0,
  position      integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (series_id, team_id)
);

create index if not exists idx_points_series on public.points_table (series_id, position);

-- ============================================================================
-- VIDEOS
-- ============================================================================

create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text,
  video_url   text not null,
  thumbnail   text,
  source      text not null default 'YouTube',
  category    text not null default 'Highlights',
  published_at timestamptz not null default now(),
  is_featured boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- ADVERTISEMENTS
-- ============================================================================

create table if not exists public.advertisements (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slot        text not null check (slot in ('header','home_top','home_middle','home_bottom','live_top','news_inline','sidebar','match_top','footer','npl_top')),
  format      text not null default 'banner' check (format in ('banner','leaderboard','skyscraper','inarticle','responsive')),
  type        text not null default 'image' check (type in ('image','html','google')),
  image_url   text,
  html        text,
  ad_client   text,
  link_url    text,
  start_date  date,
  end_date    date,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- LOGS & SETTINGS
-- ============================================================================

create table if not exists public.api_logs (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,                    -- 'cricket_api' | 'news_api' | ...
  level       text not null default 'info' check (level in ('info','warn','error')),
  endpoint    text,
  status_code integer,
  message     text,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_api_logs_source_time on public.api_logs (source, created_at desc);

create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.sync_status (
  id           uuid primary key default gen_random_uuid(),
  job          text not null unique,            -- 'cricket_sync' | 'news_sync' | ...
  status       text not null default 'idle' check (status in ('idle','running','success','error')),
  last_run_at  timestamptz,
  last_success_at timestamptz,
  last_error   text,
  last_message text,
  updated_at   timestamptz not null default now()
);

-- ============================================================================
-- MATERIALIZED VIEW — points table joins
-- ============================================================================

create or replace view public.v_points_table as
select
  pt.id, pt.series_id, s.name as series_name, s.slug as series_slug,
  pt.team_id, t.name as team_name, t.short_name, t.slug as team_slug, t.logo_url,
  pt.matches, pt.wins, pt.losses, pt.no_result, pt.ties, pt.points, pt.net_run_rate, pt.position
from public.points_table pt
join public.series s on s.id = pt.series_id
join public.teams t on t.id = pt.team_id;

-- ============================================================================
-- Helper: updated_at trigger
-- ============================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['users','news','teams','series','matches','match_scores','players','points_table','advertisements'] loop
    execute format('drop trigger if exists trg_%s_updated on public.%I', t, t);
    execute format('create trigger trg_%s_updated before update on public.%I
                    for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================================
-- Row Level Security (defaults — tighten per deployment)
-- ============================================================================

alter table public.news           enable row level security;
alter table public.matches        enable row level security;
alter table public.teams          enable row level security;
alter table public.players        enable row level security;
alter table public.series         enable row level security;
alter table public.points_table   enable row level security;
alter table public.ball_by_ball   enable row level security;
alter table public.match_scores   enable row level security;
alter table public.innings        enable row level security;
alter table public.videos         enable row level security;
alter table public.advertisements enable row level security;
alter table public.news_sources   enable row level security;
alter table public.site_settings  enable row level security;
alter table public.sync_status    enable row level security;

-- Public read access for content tables
create policy "public_read_news"           on public.news           for select using (status = 'published');
create policy "public_read_matches"        on public.matches        for select using (true);
create policy "public_read_teams"          on public.teams          for select using (true);
create policy "public_read_players"        on public.players        for select using (true);
create policy "public_read_series"         on public.series         for select using (true);
create policy "public_read_points"         on public.points_table   for select using (true);
create policy "public_read_bbb"            on public.ball_by_ball   for select using (true);
create policy "public_read_scores"         on public.match_scores   for select using (true);
create policy "public_read_innings"        on public.innings        for select using (true);
create policy "public_read_videos"         on public.videos         for select using (true);
create policy "public_read_ads"            on public.advertisements for select using (enabled = true);
create policy "public_read_settings"       on public.site_settings  for select using (true);
create policy "public_read_sync_status"    on public.sync_status    for select using (true);
create policy "public_read_sources"        on public.news_sources   for select using (enabled = true);
