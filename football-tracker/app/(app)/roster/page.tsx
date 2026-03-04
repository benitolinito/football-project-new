import { POSITION_GROUPS, PositionGroup } from "@/lib/domain/positions";
import { getRosterPageData } from "@/lib/queries/roster";

type SearchParams = Record<string, string | string[] | undefined>;

type RosterPageProps = {
  searchParams?: Promise<SearchParams>;
};

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function isPositionGroup(value: string | undefined): value is PositionGroup {
  return Boolean(value && POSITION_GROUPS.includes(value as PositionGroup));
}

function deltaStyles(delta: number): string {
  if (delta < 0) return "border-amber-200 bg-amber-50 text-amber-800";
  if (delta > 0) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export default async function RosterPage({ searchParams }: RosterPageProps) {
  const params = (await searchParams) ?? {};

  const rawPositionGroup = getParam(params, "positionGroup");
  const filters = {
    seasonId: getParam(params, "seasonId"),
    query: getParam(params, "query"),
    positionGroup: isPositionGroup(rawPositionGroup) ? rawPositionGroup : undefined,
    sideOfBall: getParam(params, "sideOfBall") as "offense" | "defense" | "special" | undefined,
    classYear: getParam(params, "classYear"),
    status: getParam(params, "status"),
    state: getParam(params, "state"),
    highSchool: getParam(params, "highSchool"),
    developmentTag: getParam(params, "developmentTag"),
  };

  const data = await getRosterPageData(filters);

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Roster
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Season Roster Workspace</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Filter and scan roster entries by season, position, class year, status, and profile
        attributes. This page is the PRD-aligned baseline for replacing spreadsheet workflows.
      </p>

      {data.errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {data.errorMessage}
        </p>
      ) : null}

      <form className="mt-5 grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label htmlFor="query" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            Search
          </label>
          <input
            id="query"
            name="query"
            defaultValue={filters.query ?? ""}
            placeholder="Player, school, state, position"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>

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

        <div>
          <label htmlFor="positionGroup" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            Position
          </label>
          <select
            id="positionGroup"
            name="positionGroup"
            defaultValue={filters.positionGroup ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {POSITION_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sideOfBall" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            Side
          </label>
          <select
            id="sideOfBall"
            name="sideOfBall"
            defaultValue={filters.sideOfBall ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="offense">Offense</option>
            <option value="defense">Defense</option>
            <option value="special">Special Teams</option>
          </select>
        </div>

        <div>
          <label htmlFor="classYear" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            Class Year
          </label>
          <select
            id="classYear"
            name="classYear"
            defaultValue={filters.classYear ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {data.uniqueClassYears.map((classYear) => (
              <option key={classYear} value={classYear}>
                {classYear}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {data.uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="state" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            State
          </label>
          <select
            id="state"
            name="state"
            defaultValue={filters.state ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {data.uniqueStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="highSchool" className="mb-1 block text-xs font-medium uppercase text-zinc-600">
            High School
          </label>
          <select
            id="highSchool"
            name="highSchool"
            defaultValue={filters.highSchool ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {data.uniqueHighSchools.map((highSchool) => (
              <option key={highSchool} value={highSchool}>
                {highSchool}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="developmentTag"
            className="mb-1 block text-xs font-medium uppercase text-zinc-600"
          >
            Development Tag
          </label>
          <select
            id="developmentTag"
            name="developmentTag"
            defaultValue={filters.developmentTag ?? ""}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {data.uniqueDevelopmentTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 lg:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Apply Filters
          </button>
          <a
            href="/roster"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Clear
          </a>
        </div>
      </form>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
            Targets vs Actual
          </h3>
          <span className="text-xs text-zinc-500">Selected season snapshot</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {data.targets.length === 0 ? (
            <p className="text-sm text-zinc-600">No targets available for this season.</p>
          ) : (
            data.targets.map((target) => (
              <div
                key={target.positionGroup}
                className={`rounded-md border px-3 py-2 text-xs ${deltaStyles(target.delta)}`}
              >
                <p className="font-semibold">{target.positionGroup}</p>
                <p>
                  {target.actualCount}/{target.targetCount} (delta {target.delta})
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
            Roster Entries ({data.rosterRows.length})
          </h3>
        </div>

        {data.rosterRows.length === 0 ? (
          <p className="px-4 py-4 text-sm text-zinc-600">No roster entries match current filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Player</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Position</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Class</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Status</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Depth</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">State</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">High School</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Dev Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.rosterRows.map((row) => (
                  <tr key={row.id} className="odd:bg-white even:bg-zinc-50/40">
                    <td className="px-3 py-2 text-zinc-800">{row.fullName}</td>
                    <td className="px-3 py-2 text-zinc-800">
                      {row.positionGroup}
                      {row.positionDetail ? ` (${row.positionDetail})` : ""}
                    </td>
                    <td className="px-3 py-2 text-zinc-800">{row.classYear ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{row.status}</td>
                    <td className="px-3 py-2 text-zinc-800">{row.depthTag ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{row.state ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{row.highSchool ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{row.developmentTag ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
