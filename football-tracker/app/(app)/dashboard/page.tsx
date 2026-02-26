const MVP_PHASES = [
  "Auth + roles + RLS",
  "Core schema (players, seasons, roster entries, targets)",
  "Roster list + filters",
  "Targets vs actual dashboard",
  "Player profile notes + awards",
  "Scenario sandbox isolation",
  "Audit trail hardening",
];

export default function DashboardPage() {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Dashboard
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">MVP Build Tracker</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        This branch is the implementation baseline for the personnel management MVP.
        It keeps the original lineup prototype while organizing the app around PRD flows.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Week 1 priorities</h3>
        <ul className="mt-3 grid gap-2 text-sm text-zinc-700">
          {MVP_PHASES.map((item) => (
            <li key={item} className="rounded-md border border-zinc-200 bg-white px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
