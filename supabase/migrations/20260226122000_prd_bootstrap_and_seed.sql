-- Bootstrap profile rows from auth users and add MVP seed data

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, updated_by)
  values (new.id, new.email, 'staff', new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.seasons (season_year, label, is_official)
values
  (2025, 'Fall 2025', true),
  (2026, 'Fall 2026', true),
  (2027, 'Fall 2027', true)
on conflict (season_year) do update
set
  label = excluded.label,
  is_official = excluded.is_official;

with season_map as (
  select id, season_year
  from public.seasons
  where season_year in (2025, 2026, 2027)
),
seed_targets as (
  select * from (values
    (2025, 'DB'::public.position_group, 20),
    (2025, 'LB'::public.position_group, 15),
    (2025, 'DL'::public.position_group, 17),
    (2025, 'OL'::public.position_group, 18),
    (2025, 'RB'::public.position_group, 8),
    (2025, 'QB'::public.position_group, 6),
    (2025, 'TE'::public.position_group, 7),
    (2025, 'WR'::public.position_group, 13),
    (2025, 'SPC'::public.position_group, 4),

    (2026, 'DB'::public.position_group, 20),
    (2026, 'LB'::public.position_group, 15),
    (2026, 'DL'::public.position_group, 17),
    (2026, 'OL'::public.position_group, 18),
    (2026, 'RB'::public.position_group, 8),
    (2026, 'QB'::public.position_group, 6),
    (2026, 'TE'::public.position_group, 7),
    (2026, 'WR'::public.position_group, 13),
    (2026, 'SPC'::public.position_group, 4),

    (2027, 'DB'::public.position_group, 20),
    (2027, 'LB'::public.position_group, 15),
    (2027, 'DL'::public.position_group, 17),
    (2027, 'OL'::public.position_group, 18),
    (2027, 'RB'::public.position_group, 8),
    (2027, 'QB'::public.position_group, 6),
    (2027, 'TE'::public.position_group, 7),
    (2027, 'WR'::public.position_group, 13),
    (2027, 'SPC'::public.position_group, 4)
  ) as t(season_year, position_group, target_count)
)
insert into public.position_targets (season_id, position_group, target_count)
select sm.id, st.position_group, st.target_count
from seed_targets st
join season_map sm
  on sm.season_year = st.season_year
on conflict (season_id, position_group) do update
set target_count = excluded.target_count;
