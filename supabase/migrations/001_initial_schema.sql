-- Migration: 001_initial_schema
-- Criado em: 2026-04-03

-- USERS
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  champion_pick text default null,
  total_points integer not null default 0,
  exact_scores integer not null default 0,
  created_at timestamptz not null default now()
);

-- MATCHES
create type match_phase as enum ('groups', 'r16', 'qf', 'sf', 'final');
create type match_status as enum ('open', 'locked', 'live', 'finished');

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  api_id text unique,
  team_home text not null,
  flag_home text not null default '',
  team_away text not null,
  flag_away text not null default '',
  score_home integer default null,
  score_away integer default null,
  match_time timestamptz not null,
  phase match_phase not null default 'groups',
  status match_status not null default 'open',
  multiplier integer not null default 1,
  group_name text default null,
  created_at timestamptz not null default now()
);

-- PICKS
create table public.picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  pick_home integer not null,
  pick_away integer not null,
  points_earned integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, match_id)
);

-- INDEXES
create index idx_picks_user_id on public.picks(user_id);
create index idx_picks_match_id on public.picks(match_id);
create index idx_matches_status on public.matches(status);
create index idx_matches_match_time on public.matches(match_time);

-- RLS
alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.picks enable row level security;

create policy "users_select_all" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (true);
create policy "users_update_own" on public.users for update using (true);
create policy "matches_select_all" on public.matches for select using (true);
create policy "picks_select_all" on public.picks for select using (true);
create policy "picks_insert" on public.picks for insert with check (true);
create policy "picks_update_own" on public.picks for update using (true);

-- FUNCTIONS
create or replace function calculate_points(
  pick_home integer, pick_away integer,
  score_home integer, score_away integer,
  multiplier integer
) returns integer language plpgsql as $$
declare base_points integer := 0;
begin
  if pick_home = score_home and pick_away = score_away then base_points := 3;
  elsif (pick_home > pick_away and score_home > score_away) or
        (pick_home < pick_away and score_home < score_away) or
        (pick_home = pick_away and score_home = score_away) then base_points := 1;
  end if;
  return base_points * multiplier;
end;
$$;

create or replace function update_picks_on_match_finish()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'finished' and NEW.score_home is not null and NEW.score_away is not null then
    update public.picks
    set points_earned = calculate_points(pick_home, pick_away, NEW.score_home, NEW.score_away, NEW.multiplier)
    where match_id = NEW.id;
    update public.users u
    set
      total_points = (select coalesce(sum(p.points_earned),0) from public.picks p where p.user_id = u.id),
      exact_scores = (select count(*) from public.picks p join public.matches m on m.id = p.match_id
        where p.user_id = u.id and p.pick_home = m.score_home and p.pick_away = m.score_away and m.status = 'finished')
    where u.id in (select distinct user_id from public.picks where match_id = NEW.id);
  end if;
  return NEW;
end;
$$;

create trigger trg_match_finished
  after update on public.matches
  for each row execute function update_picks_on_match_finish();
