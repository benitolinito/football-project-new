# Dartmouth Football Personnel System (MVP Foundation)

This app is the implementation baseline for the MVP described in the PRD.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + RLS)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill values:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

Root path redirects to `/dashboard`.

## Current Route Structure

- `/dashboard`: roster health (105-110 guardrail + target vs actual)
- `/roster`: season roster table with PRD filters
- `/players`: player directory with search and filters
- `/players/[id]`: profile overview + notes/awards view/edit forms
- `/scenarios`: sandbox create/switch/edit (isolated scenario targets + roster entries)
- `/lineup`: original lineup prototype (preserved)
- `/login`: staff authentication

## Auth

- `/login` uses Supabase email/password sign-in.
- Protected routes (`/dashboard`, `/roster`, `/players`, `/scenarios`, `/lineup`) require an active Supabase session.
- Role is resolved from `profiles.role` (`admin` or `staff`).

## Domain Contract Files

Canonical MVP contracts are defined in:

- `lib/domain/models.ts`
- `lib/domain/positions.ts`
- `lib/auth/roles.ts`

These are the source for schema and query implementation in upcoming slices.

## Supabase Schema

PRD-aligned migrations now live at:

- `../supabase/migrations`

See `../supabase/README.md` for migration contents and local reset workflow.
