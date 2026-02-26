import { getDashboardData } from "@/lib/queries/dashboard";

type SearchParams = Record<string, string | string[] | undefined>;

type DashboardPageProps = {
  searchParams?: Promise<SearchParams>;
};

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function rosterStatusStyles(status: "under" | "on" | "over"): string {
  if (status === "under") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "over") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function positionStatusStyles(status: "under" | "on" | "over"): string {
  if (status === "under") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "over") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const seasonId = getParam(params, "seasonId");
  const data = await getDashboardData(seasonId);

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Dashboard
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Roster Health Dashboard</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        PRD MVP view for season-level personnel health: total roster count against the
        105-110 guardrail and target-vs-actual by position group.
      </p>

      {data.errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {data.errorMessage}
        </p>
      ) : null}

      <form className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_auto] sm:items-end">
          <div>
            <label htmlFor="seasonId" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
              Season
            </label>
            <select
              id="seasonId"
              name="seasonId"
              defaultValue={data.selectedSeasonId ?? ""}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              {data.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Apply Season
            </button>
            <a
              href="/dashboard"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Latest
            </a>
          </div>
        </div>
      </form>

      <section className="mt-5 grid gap-3 md:grid-cols-4">
        <div className={`rounded-xl border px-4 py-3 ${rosterStatusStyles(data.rosterStatus)}`}>
          <p className="text-xs font-semibold uppercase tracking-wide">Roster Count</p>
          <p className="mt-1 text-2xl font-semibold">{data.rosterCount}</p>
          <p className="mt-1 text-xs">Target range: 105-110</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Under Target</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{data.underCount}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">On Target</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{data.onTargetCount}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Over Target</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">{data.overCount}</p>
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
            Position Health
          </h3>
          <p className="text-xs text-zinc-500">{data.selectedSeasonLabel ?? "No season selected"}</p>
        </div>

        {data.positions.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No position targets found for this season.</p>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {data.positions.map((position) => (
              <div
                key={position.positionGroup}
                className={`rounded-lg border px-3 py-3 ${positionStatusStyles(position.status)}`}
              >
                <p className="text-sm font-semibold">{position.positionGroup}</p>
                <p className="mt-1 text-xs">
                  Actual: {position.actualCount} | Target: {position.targetCount}
                </p>
                <p className="mt-1 text-xs">Delta: {position.delta}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
