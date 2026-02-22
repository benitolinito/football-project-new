import { fetchTablePreview, TableRow } from "@/lib/supabaseData";
import TeamArranger, { type PlayerOption } from "@/components/TeamArranger";

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getColumns(rows: TableRow[], hiddenColumns: Set<string>): string[] {
  const columnSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!hiddenColumns.has(key)) {
        columnSet.add(key);
      }
    }
  }
  return Array.from(columnSet).sort((a, b) => a.localeCompare(b));
}

function sortRows(rows: TableRow[]): TableRow[] {
  return [...rows].sort((a, b) => {
    const aId = a.id;
    const bId = b.id;
    if (typeof aId === "string" && typeof bId === "string") {
      return aId.localeCompare(bId);
    }
    return JSON.stringify(a).localeCompare(JSON.stringify(b));
  });
}

function getStringValue(row: TableRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (value === null || value === undefined) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return null;
}

function buildPlayerOptions(rows: TableRow[]): PlayerOption[] {
  return rows
    .map((row, index) => {
      const id =
        getStringValue(row, ["id", "player_id", "uuid"]) ?? `player-${index + 1}`;
      const firstName = getStringValue(row, ["first_name", "firstname", "first"]);
      const lastName = getStringValue(row, ["last_name", "lastname", "last"]);
      const fullName =
        getStringValue(row, ["name", "full_name", "player_name"]) ??
        [firstName, lastName].filter(Boolean).join(" ").trim();
      const position = getStringValue(row, ["position", "pos"]);
      const jerseyNumber = getStringValue(row, [
        "jersey_number",
        "jersey",
        "uniform_number",
        "number",
      ]);
      const team = getStringValue(row, [
        "team",
        "team_name",
        "team_abbr",
        "abbr",
      ]);
      const baseLabel = fullName || `Player ${index + 1}`;
      const suffixParts = [position, team].filter(Boolean);

      return {
        id,
        position,
        jerseyNumber,
        label:
          suffixParts.length > 0
            ? `${baseLabel} (${suffixParts.join(" · ")})`
            : baseLabel,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function DataTable({
  rows,
  hiddenColumnNames = ["created_at"],
}: {
  rows: TableRow[];
  hiddenColumnNames?: string[];
}) {
  const normalizedRows = sortRows(rows);
  const columns = getColumns(normalizedRows, new Set(hiddenColumnNames));

  if (normalizedRows.length === 0) {
    return (
      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
        No rows returned.
      </p>
    );
  }

  return (
    <div className="max-h-[26rem] overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full table-auto divide-y divide-zinc-200 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="break-words px-3 py-2 font-semibold text-zinc-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {normalizedRows.map((row, rowIndex) => (
            <tr
              key={String(row.id ?? rowIndex)}
              className="odd:bg-white even:bg-zinc-50/40"
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="max-w-64 break-words px-3 py-2 align-top text-zinc-800"
                  title={formatCellValue(row[column])}
                >
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Home() {
  const [teamsResult, playersResult] = await Promise.all([
    fetchTablePreview("teams", 50),
    fetchTablePreview("players", 200),
  ]);
  const teamsRows = teamsResult.data ?? [];
  const playersRows = playersResult.data ?? [];
  const playerOptions = buildPlayerOptions(playersRows);
  const teamsError = teamsResult.errorMessage;
  const playersError = playersResult.errorMessage;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8fff1_0%,_#f3f4f6_35%,_#e5e7eb_100%)] px-4 py-6 text-zinc-900 sm:px-6 sm:py-10">
      <main className="mx-auto w-full max-w-[96rem]">
        <section className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
                Football Project
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                American Football Lineup Builder
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
                Build an offensive lineup on the field using your Supabase player data, with
                position-aware dropdowns and a live lineup summary.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                Teams: {teamsRows.length}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                Players: {playersRows.length}
              </span>
              <form action="/" method="get">
                <button
                  type="submit"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  Refresh Data
                </button>
              </form>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-8">
          <TeamArranger players={playerOptions} />

          <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Teams ({teamsRows.length})
              </h2>
              <p className="text-xs text-zinc-500">Reference table</p>
            </div>
            {teamsError ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {teamsError}
              </p>
            ) : (
              <div className="mt-3">
                <DataTable rows={teamsRows} />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Players ({playersRows.length})
              </h2>
              <p className="text-xs text-zinc-500">
                IDs hidden in table and dropdown labels
              </p>
            </div>
            {playersError ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {playersError}
              </p>
            ) : (
              <div className="mt-3">
                <DataTable
                  rows={playersRows}
                  hiddenColumnNames={["created_at", "id", "player_id"]}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
