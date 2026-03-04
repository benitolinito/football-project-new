-- PRD v2.0 core schema for Dartmouth Football Personnel System
-- Entities: players, seasons, roster entries, targets, notes, awards, scenarios, scenario copies, profiles, audit log

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'staff');
create type public.position_group as enum ('QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'SPC');
create type public.roster_status as enum ('active', 'redshirt', 'injured', 'departed', 'graduated');
create type public.audit_action as enum ('insert', 'update', 'delete');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role public.app_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text,
  height_inches integer,
  weight_lbs integer,
  high_school text,
  state text,
  dartmouth_class text,
  development_tag text,
  games_played integer,
  games_started integer,
  eval_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint players_height_positive check (height_inches is null or height_inches > 0),
  constraint players_weight_positive check (weight_lbs is null or weight_lbs > 0),
  constraint players_games_played_non_negative check (games_played is null or games_played >= 0),
  constraint players_games_started_non_negative check (games_started is null or games_started >= 0)
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  season_year integer not null unique,
  label text not null unique,
  is_official boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint seasons_year_reasonable check (season_year between 2000 and 2100)
);

create table if not exists public.roster_entries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  season_id uuid not null references public.seasons (id) on delete cascade,
  position_group public.position_group not null,
  position_detail text,
  class_year text,
  status public.roster_status not null default 'active',
  depth_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  unique (player_id, season_id)
);

create table if not exists public.position_targets (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  position_group public.position_group not null,
  target_count integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint position_targets_target_non_negative check (target_count >= 0),
  unique (season_id, position_group)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  season_id uuid references public.seasons (id) on delete set null,
  note_text text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint notes_text_not_blank check (btrim(note_text) <> '')
);

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  season_id uuid references public.seasons (id) on delete set null,
  award_tag text not null,
  award_label text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint awards_tag_not_blank check (btrim(award_tag) <> ''),
  constraint awards_label_not_blank check (btrim(award_label) <> '')
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_season_id uuid not null references public.seasons (id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint scenarios_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.scenario_roster_entries (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  position_group public.position_group not null,
  position_detail text,
  class_year text,
  status public.roster_status not null default 'active',
  depth_tag text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  unique (scenario_id, player_id)
);

create table if not exists public.scenario_targets (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios (id) on delete cascade,
  position_group public.position_group not null,
  target_count integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint scenario_targets_target_non_negative check (target_count >= 0),
  unique (scenario_id, position_group)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id),
  entity_type text not null,
  entity_id uuid,
  action public.audit_action not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_players_full_name on public.players (full_name);
create index if not exists idx_players_high_school on public.players (high_school);
create index if not exists idx_players_state on public.players (state);
create index if not exists idx_players_development_tag on public.players (development_tag);

create index if not exists idx_roster_entries_season on public.roster_entries (season_id);
create index if not exists idx_roster_entries_position_group on public.roster_entries (position_group);
create index if not exists idx_roster_entries_status on public.roster_entries (status);

create index if not exists idx_notes_player on public.notes (player_id);
create index if not exists idx_notes_season on public.notes (season_id);
create index if not exists idx_awards_player on public.awards (player_id);
create index if not exists idx_awards_season on public.awards (season_id);
create index if not exists idx_awards_tag on public.awards (award_tag);

create index if not exists idx_scenarios_base_season on public.scenarios (base_season_id);
create index if not exists idx_scenario_roster_entries_scenario on public.scenario_roster_entries (scenario_id);
create index if not exists idx_scenario_targets_scenario on public.scenario_targets (scenario_id);

create or replace function public.set_updated_metadata()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  target_entity_id uuid;
begin
  target_entity_id := case when tg_op = 'DELETE' then old.id else new.id end;

  payload := case
    when tg_op = 'INSERT' then jsonb_build_object('new', to_jsonb(new))
    when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
    when tg_op = 'DELETE' then jsonb_build_object('old', to_jsonb(old))
  end;

  insert into public.audit_log (actor_user_id, entity_type, entity_id, action, metadata)
  values (
    auth.uid(),
    tg_table_name,
    target_entity_id,
    lower(tg_op)::public.audit_action,
    payload
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger trg_profiles_set_updated before update on public.profiles
for each row execute function public.set_updated_metadata();
create trigger trg_players_set_updated before update on public.players
for each row execute function public.set_updated_metadata();
create trigger trg_seasons_set_updated before update on public.seasons
for each row execute function public.set_updated_metadata();
create trigger trg_roster_entries_set_updated before update on public.roster_entries
for each row execute function public.set_updated_metadata();
create trigger trg_position_targets_set_updated before update on public.position_targets
for each row execute function public.set_updated_metadata();
create trigger trg_notes_set_updated before update on public.notes
for each row execute function public.set_updated_metadata();
create trigger trg_awards_set_updated before update on public.awards
for each row execute function public.set_updated_metadata();
create trigger trg_scenarios_set_updated before update on public.scenarios
for each row execute function public.set_updated_metadata();
create trigger trg_scenario_roster_entries_set_updated before update on public.scenario_roster_entries
for each row execute function public.set_updated_metadata();
create trigger trg_scenario_targets_set_updated before update on public.scenario_targets
for each row execute function public.set_updated_metadata();

create trigger trg_players_audit after insert or update or delete on public.players
for each row execute function public.log_audit_event();
create trigger trg_roster_entries_audit after insert or update or delete on public.roster_entries
for each row execute function public.log_audit_event();
create trigger trg_position_targets_audit after insert or update or delete on public.position_targets
for each row execute function public.log_audit_event();
create trigger trg_notes_audit after insert or update or delete on public.notes
for each row execute function public.log_audit_event();
create trigger trg_awards_audit after insert or update or delete on public.awards
for each row execute function public.log_audit_event();
create trigger trg_scenarios_audit after insert or update or delete on public.scenarios
for each row execute function public.log_audit_event();
create trigger trg_scenario_roster_entries_audit after insert or update or delete on public.scenario_roster_entries
for each row execute function public.log_audit_event();
create trigger trg_scenario_targets_audit after insert or update or delete on public.scenario_targets
for each row execute function public.log_audit_event();

create or replace view public.v_position_counts
with (security_invoker = true) as
select
  re.season_id,
  re.position_group,
  count(*)::integer as actual_count
from public.roster_entries re
group by re.season_id, re.position_group;

create or replace view public.v_target_vs_actual
with (security_invoker = true) as
select
  pt.season_id,
  pt.position_group,
  pt.target_count,
  coalesce(vpc.actual_count, 0) as actual_count,
  coalesce(vpc.actual_count, 0) - pt.target_count as delta
from public.position_targets pt
left join public.v_position_counts vpc
  on vpc.season_id = pt.season_id
 and vpc.position_group = pt.position_group;
