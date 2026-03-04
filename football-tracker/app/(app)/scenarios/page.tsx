import Link from "next/link";
import { POSITION_GROUPS } from "@/lib/domain/positions";
import { getScenariosPageData } from "@/lib/queries/scenarios";
import {
  createScenarioAction,
  updateScenarioRosterEntryAction,
  updateScenarioTargetAction,
} from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;

type ScenariosPageProps = {
  searchParams?: Promise<SearchParams>;
};

const STATUS_OPTIONS = ["active", "redshirt", "injured", "departed", "graduated"] as const;

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function deltaStyles(delta: number): string {
  if (delta < 0) return "border-amber-200 bg-amber-50 text-amber-800";
  if (delta > 0) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export default async function ScenariosPage({ searchParams }: ScenariosPageProps) {
  const params = (await searchParams) ?? {};
  const scenarioId = getParam(params, "scenarioId");

  const data = await getScenariosPageData(scenarioId);
  const selectedScenario = data.selectedScenario;

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Scenarios
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Sandbox Planning Workspace</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Create sandbox scenarios from official seasons and test roster/target changes without
        mutating official data. All edits on this screen are isolated to scenario tables.
      </p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Sandbox mode: scenario edits never modify `roster_entries` or `position_targets`.
      </div>

      {data.errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {data.errorMessage}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
          Create Scenario From Season
        </h3>
        <form action={createScenarioAction} className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <div>
            <label htmlFor="scenario-name" className="mb-1 block text-xs uppercase text-zinc-500">
              Scenario Name
            </label>
            <input
              id="scenario-name"
              name="name"
              required
              placeholder="e.g. Fall 2026 aggressive DB intake"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="base-season" className="mb-1 block text-xs uppercase text-zinc-500">
              Base Season
            </label>
            <select
              id="base-season"
              name="baseSeasonId"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              {data.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-[42px] rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create Sandbox
          </button>
        </form>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Scenarios</h3>
          {data.scenarios.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No scenarios yet.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {data.scenarios.map((scenario) => {
                const selected = scenario.id === data.selectedScenarioId;

                return (
                  <Link
                    key={scenario.id}
                    href={`/scenarios?scenarioId=${scenario.id}`}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      selected
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <p className="font-medium">{scenario.name}</p>
                    <p className="mt-1 text-xs">{scenario.baseSeasonLabel}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          {!selectedScenario ? (
            <p className="text-sm text-zinc-600">Choose a scenario to view and edit sandbox data.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-900">{selectedScenario.name}</h3>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                  Base: {selectedScenario.baseSeasonLabel}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                  Created: {formatDate(selectedScenario.createdAt)}
                </span>
              </div>

              <section className="mt-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
                  Scenario Targets vs Actual
                </h4>
                {selectedScenario.targets.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">No targets in this scenario.</p>
                ) : (
                  <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {selectedScenario.targets.map((target) => (
                      <form
                        key={target.id}
                        action={updateScenarioTargetAction}
                        className={`rounded-lg border p-3 ${deltaStyles(target.delta)}`}
                      >
                        <input type="hidden" name="scenarioId" value={selectedScenario.id} />
                        <input type="hidden" name="scenarioTargetId" value={target.id} />
                        <p className="text-sm font-semibold">{target.positionGroup}</p>
                        <p className="mt-1 text-xs">
                          Actual: {target.actualCount} | Delta: {target.delta}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            name="targetCount"
                            min={0}
                            defaultValue={target.targetCount}
                            className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-5">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
                  Scenario Roster Entries ({selectedScenario.rosterEntries.length})
                </h4>

                {selectedScenario.rosterEntries.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">No roster entries in this scenario.</p>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {selectedScenario.rosterEntries.map((entry) => (
                      <form
                        key={entry.id}
                        action={updateScenarioRosterEntryAction}
                        className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 lg:grid-cols-[minmax(0,1.4fr)_130px_150px_120px_120px_auto] lg:items-end"
                      >
                        <input type="hidden" name="scenarioId" value={selectedScenario.id} />
                        <input type="hidden" name="scenarioRosterEntryId" value={entry.id} />

                        <div>
                          <p className="text-sm font-medium text-zinc-900">{entry.playerName}</p>
                          <input
                            name="positionDetail"
                            defaultValue={entry.positionDetail ?? ""}
                            placeholder="Position detail"
                            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs"
                          />
                        </div>

                        <label className="grid gap-1 text-xs text-zinc-600">
                          Position
                          <select
                            name="positionGroup"
                            defaultValue={entry.positionGroup}
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
                          >
                            {POSITION_GROUPS.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="grid gap-1 text-xs text-zinc-600">
                          Status
                          <select
                            name="status"
                            defaultValue={entry.status}
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="grid gap-1 text-xs text-zinc-600">
                          Class Year
                          <input
                            name="classYear"
                            defaultValue={entry.classYear ?? ""}
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
                          />
                        </label>

                        <label className="grid gap-1 text-xs text-zinc-600">
                          Depth
                          <input
                            name="depthTag"
                            defaultValue={entry.depthTag ?? ""}
                            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
                          />
                        </label>

                        <button
                          type="submit"
                          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                        >
                          Save
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </section>
  );
}
