import Link from "next/link";
import { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roster", label: "Roster" },
  { href: "/players", label: "Players" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/lineup", label: "Lineup Prototype" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Access denied. Set `NEXT_PUBLIC_DEV_ROLE` to `admin` or `staff` in
        `.env.local` while auth integration is in progress.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto grid w-full max-w-[1200px] gap-4 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-6 lg:py-8">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Dartmouth Football
          </p>
          <h1 className="mt-2 text-lg font-semibold">Personnel System</h1>
          <p className="mt-1 text-sm text-zinc-600">MVP foundation workspace</p>

          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
            <p>
              Signed in as <span className="font-medium">{sessionUser.email}</span>
            </p>
            <p className="mt-1 uppercase tracking-wide text-zinc-500">
              Role: {sessionUser.role}
            </p>
          </div>

          <nav className="mt-5 grid gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
