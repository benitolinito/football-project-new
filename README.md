# Football Player Tracker

A football player tracker with drag-and-drop lineup formations.

## Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd Football-Project
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Connect to Supabase

1. Install the Supabase client (already added to `package.json`; run the install if you haven't):

```bash
cd football-tracker
npm install
```

2. Create `football-tracker/.env.local` with your project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
# (optional, server-only) SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

3. Use the shared client in your app code:

```ts
// example inside a server component or route handler
import { getSupabaseClient } from "@/lib/supabaseClient";

export default async function Page() {
  const supabase = getSupabaseClient();
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, position");

  if (error) {
    return <p>Failed to load players: {error.message}</p>;
  }

  return (
    <ul>
      {players?.map((player) => (
        <li key={player.id}>
          {player.name} — {player.position}
        </li>
      ))}
    </ul>
  );
}
```

- For client components, the same `getSupabaseClient()` works because it uses the public anon key.
- Keep the service role key out of `NEXT_PUBLIC_*` vars; use it only in server routes or server actions.
