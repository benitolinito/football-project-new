-- Add scenario archival support for safe sandbox lifecycle management

alter table public.scenarios
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users (id);

create index if not exists idx_scenarios_archived_at on public.scenarios (archived_at);
