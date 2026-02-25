# AGENTS.md

## Project Context

- Product: Dartmouth Football Roster & Personnel Management System (MVP, personnel-focused)
- Users: Dartmouth Football coaching and recruiting staff
- Platform: Private internal web app
- Expected roster size: ~105-110 players
- App code lives in `football-tracker/` (Next.js/React app)

## Product Mission

Build a private, shared system that replaces fragile Excel roster planning with a structured, queryable application that:

- Preserves historical roster states
- Supports forward-looking roster planning over a four-year cycle
- Makes positional counts and roster gaps obvious
- Enables multiple staff members to work safely in the same system

## MVP Goals (What To Optimize For)

- Fast answers to common roster questions (target: <10 seconds)
- Historical rosters remain viewable without deleting old data
- Position counts vs targets are always visible
- Reduced reliance on Excel for roster planning

## In Scope (MVP)

### Player Profiles (Structured)

Each player should support a persistent profile with:

- Name
- Photo
- Position(s)
- Height / Weight
- High School
- State
- Dartmouth Class (25-28)
- Rank / Development Tag
- Games played / started
- Awards
- Notes (free text)
- Eval (text)

### Roster Views & Visualization

- Overall roster view
- Breakdown by grade/year
- Position room views
- Side-of-ball views
- Historical roster snapshots
- Dashboard with:
  - Position counts vs targets
  - Grade distribution
  - First-time starters
  - Gaps and overages (color-coded)

### Future Planning & Scenarios

- Slot-based planning per year (for example, `SLOT 1`, `SLOT 2`)
- Scenario/sandbox rosters that do not affect official data
- Projection of downstream effects across years

### Depth & Comparison (Internal Only)

- Live depth chart visualization
- Compare players within a position

## Out of Scope (MVP)

Do not build these unless explicitly requested:

- Playbooks, routes, or formations
- Game strategy or opponent analysis
- On-field visualization
- Advanced performance analytics
- Full recruiting pipeline tooling

## Core Domain Rules (Non-Negotiable)

- Total roster size target: 105-110 players
- Roster planning operates on a four-year cycle (classes 25-28)
- Position targets are required and may vary by year
- Roster data must be tied to seasons
- Historical data must be preserved (avoid destructive overwrites)
- Scenario changes must be isolated from official roster data

### Example Baseline Position Targets

- `DB`: 20
- `LB`: 15
- `DL`: 17
- `OL`: 18
- `RB`: 8
- `QB`: 6
- `TE`: 7
- `WR`: 13
- `SPC`: 4

## Users, Access, and Security

- Use separate authenticated accounts (Supabase Auth)
- Enforce role-based access control (`admin`, `staff`; future roles optional)
- Track activity/audit changes (who changed what and when)
- App is private/internal only

## Tech Stack Expectations

- Frontend: React (current app is Next.js in `football-tracker/`)
- Backend: Supabase (Postgres, Auth, RLS)
- UI style: data-first, spreadsheet-familiar, desktop-first

## Implementation Guidance for Agents

### Data Modeling Priorities

Prefer normalized, history-safe models. Design for seasons and scenarios from the start.

Minimum entities to support MVP cleanly:

- `players` (persistent profile)
- `seasons` (roster years/snapshots)
- `roster_entries` or `season_roster_players` (player membership in a season)
- `position_targets` (by season/year)
- `scenarios` (sandbox versions)
- `scenario_roster_entries` (isolated scenario changes)
- `users` / profile roles
- `audit_log` (change tracking)

Avoid modeling that stores only a single "current roster" state.

### Query / UX Priorities

- Filtering must be fast for `position`, `year`, `high_school`, `awards`, `state`, and `development_tag`
- Surface counts and targets prominently
- Preserve spreadsheet-like scannability (tables first, visual summaries second)
- Prefer clear visual hierarchy over decorative UI

### Editing and Data Integrity

- Validate roster size and position counts in UI and/or backend constraints
- Prefer soft-delete/archival patterns for historical safety
- Make scenario edits explicit and reversible
- Do not let scenario writes mutate official season roster records

### Scope Discipline

When adding features, prioritize personnel workflow and planning value. If a request drifts toward game strategy or opponent analysis, flag it as out-of-scope for MVP.

## Functional Requirements (MVP)

Agents should preserve/support these behaviors:

- Add/edit/remove players
- Player data persists across years
- Roster data tied to seasons
- Dashboard auto-updates from roster data
- Scenario changes are isolated
- Query by:
  - Position
  - Year
  - High school
  - Awards
  - State
  - Development tag

## Non-Functional Requirements

- Desktop-first private web app
- Fast filtering and querying
- Strong data integrity
- Clear visual hierarchy
- Maintainable by a student team

## Delivery Priorities (Suggested Sequence)

1. Auth + roles + RLS foundations
2. Core schema for players/seasons/roster entries/targets
3. Roster views and filtering
4. Dashboard counts vs targets
5. Historical snapshots
6. Scenario/sandbox planning
7. Depth chart + player comparison
8. Audit/activity tracking hardening

## Acceptance Checklist for Changes

Before shipping changes that affect roster/personnel workflows, verify:

- Historical data is not overwritten or lost
- Season-aware behavior still works
- Scenario data remains isolated
- Position counts vs targets remain visible or computable
- Queries/filters remain responsive
- RBAC/RLS is not weakened
- UI remains readable for staff on desktop

