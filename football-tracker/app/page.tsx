import { fetchTablePreview, TableRow } from "@/lib/supabaseData";

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getColumns(rows: TableRow[]): string[] {
  const columnSet = new Set<string>();
  const hiddenColumns = new Set(["created_at"]);
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

function DataTable({ rows }: { rows: TableRow[] }) {
  const normalizedRows = sortRows(rows);
  const columns = getColumns(normalizedRows);

  if (normalizedRows.length === 0) {
    return (
      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
        No rows returned.
      </p>
    );
  }

  return (
    <div className="overflow-auto rounded-md border border-zinc-200">
      <table className="w-full table-fixed divide-y divide-zinc-200 text-left text-sm">
        <thead className="bg-zinc-50">
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
            <tr key={String(row.id ?? rowIndex)}>
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="break-words px-3 py-2 align-top text-zinc-800"
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
  const teamsError = teamsResult.errorMessage;
  const playersError = playersResult.errorMessage;

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-7xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Database Tables</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Live data from Supabase `public.teams` and `public.players`.
            </p>
          </div>
          <form action="/" method="get">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-center text-sm text-white"
            >
              Refresh
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-8">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">
              Teams ({teamsRows.length})
            </h2>
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

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">
              Players ({playersRows.length})
            </h2>
            {playersError ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {playersError}
              </p>
            ) : (
              <div className="mt-3">
                <DataTable rows={playersRows} />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
