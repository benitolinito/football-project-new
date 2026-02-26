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

- `/dashboard`: MVP implementation tracker
- `/roster`: season roster workspace placeholder
- `/players`: player profile workspace placeholder
- `/scenarios`: sandbox planning placeholder
- `/lineup`: original lineup prototype (preserved)

## Auth Status

Production auth is not wired yet. For local protected-shell access set:

```bash
NEXT_PUBLIC_DEV_ROLE=admin
```

or

```bash
NEXT_PUBLIC_DEV_ROLE=staff
```

in `.env.local`.

If unset, protected routes show an access-denied placeholder.

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
