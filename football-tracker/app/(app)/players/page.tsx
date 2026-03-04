import Link from "next/link";
import { getPlayersListData } from "@/lib/queries/players";

type SearchParams = Record<string, string | string[] | undefined>;

type PlayersPageProps = {
  searchParams?: Promise<SearchParams>;
};

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    query: getParam(params, "query"),
    state: getParam(params, "state"),
    highSchool: getParam(params, "highSchool"),
    developmentTag: getParam(params, "developmentTag"),
  };

  const data = await getPlayersListData(filters);

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Players
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Player Directory</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Search and filter player profiles by name, school, state, and development tag.
        Open a player to view overview details, notes, and awards.
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
            placeholder="Player, high school, state"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
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
          <Link
            href="/players"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Clear
          </Link>
        </div>
      </form>

      <section className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
            Players ({data.players.length})
          </h3>
        </div>

        {data.players.length === 0 ? (
          <p className="px-4 py-4 text-sm text-zinc-600">No players match current filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Name</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Class</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">State</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">High School</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700">Development Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.players.map((player) => (
                  <tr key={player.id} className="odd:bg-white even:bg-zinc-50/40">
                    <td className="px-3 py-2 text-zinc-800">
                      <Link href={`/players/${player.id}`} className="font-medium text-zinc-900 hover:underline">
                        {player.fullName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-zinc-800">{player.dartmouthClass ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{player.state ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{player.highSchool ?? "-"}</td>
                    <td className="px-3 py-2 text-zinc-800">{player.developmentTag ?? "-"}</td>
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
