# Supabase Schema (PRD-aligned)

This directory contains migration SQL for the Dartmouth Football Personnel MVP.

## Included

- `20260226120000_prd_core_schema.sql`
  - Core entities and constraints
  - Scenario isolation tables
  - Updated metadata trigger
  - Audit trigger and log
  - Dashboard aggregate views
- `20260226121000_prd_rls_policies.sql`
  - Role-based RLS policies for `admin` and `staff`
- `20260226122000_prd_bootstrap_and_seed.sql`
  - Auto-create `profiles` rows from `auth.users`
  - Seed seasons + baseline position targets
- `20260226124000_prd_scenario_archive_fields.sql`
  - Adds `archived_at` / `archived_by` to `scenarios`
  - Supports safe archive/delete workflow

## Local workflow (Supabase CLI)

Run from the repo root (`football-project-new/`):

```bash
supabase start
supabase db reset
```

`db reset` applies all migrations and seeds baseline seasons/targets.

## PRD ownership mapping

- `players`: permanent identity
- `roster_entries`: player-by-season assignment
- `position_targets`: desired counts by season + position
- `scenarios` + `scenario_*`: sandbox copies only
- `audit_log`: mutation history
