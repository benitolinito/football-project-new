-- PRD v2.0 access controls for admin/staff

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.seasons enable row level security;
alter table public.roster_entries enable row level security;
alter table public.position_targets enable row level security;
alter table public.notes enable row level security;
alter table public.awards enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_roster_entries enable row level security;
alter table public.scenario_targets enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles_self_or_admin_read"
on public.profiles
for select
using (auth.uid() = id or public.current_user_role() = 'admin');

create policy "profiles_admin_manage"
on public.profiles
for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "players_staff_admin_read"
on public.players
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "players_staff_admin_write"
on public.players
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "seasons_staff_admin_read"
on public.seasons
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "seasons_admin_write"
on public.seasons
for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "roster_entries_staff_admin_read"
on public.roster_entries
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "roster_entries_staff_admin_write"
on public.roster_entries
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "position_targets_staff_admin_read"
on public.position_targets
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "position_targets_staff_admin_write"
on public.position_targets
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "notes_staff_admin_read"
on public.notes
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "notes_staff_admin_write"
on public.notes
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "awards_staff_admin_read"
on public.awards
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "awards_staff_admin_write"
on public.awards
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "scenarios_staff_admin_read"
on public.scenarios
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "scenarios_staff_admin_write"
on public.scenarios
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "scenario_roster_entries_staff_admin_read"
on public.scenario_roster_entries
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "scenario_roster_entries_staff_admin_write"
on public.scenario_roster_entries
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "scenario_targets_staff_admin_read"
on public.scenario_targets
for select
using (public.current_user_role() in ('admin', 'staff'));

create policy "scenario_targets_staff_admin_write"
on public.scenario_targets
for all
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));

create policy "audit_log_admin_read"
on public.audit_log
for select
using (public.current_user_role() = 'admin');

create policy "audit_log_no_direct_writes"
on public.audit_log
for all
using (false)
with check (false);

grant select on public.v_position_counts to authenticated;
grant select on public.v_target_vs_actual to authenticated;
