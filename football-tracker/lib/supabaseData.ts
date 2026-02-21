import { getSupabaseClient } from "./supabaseClient";

export type TableRow = Record<string, unknown>;

export type TablePreviewResult = {
  data: TableRow[] | null;
  errorMessage: string | null;
};

export async function fetchTablePreview(
  tableName: string,
  limit = 10
): Promise<TablePreviewResult> {
  const table = tableName.trim();

  if (!table) {
    return {
      data: null,
      errorMessage: "Table name is required.",
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(table).select("*").limit(limit);

    if (error) {
      return {
        data: null,
        errorMessage: `${error.message} (code: ${error.code ?? "unknown"})`,
      };
    }

    return {
      data: data ?? [],
      errorMessage: null,
    };
  } catch (error) {
    return {
      data: null,
      errorMessage:
        error instanceof Error ? error.message : "Unexpected Supabase error.",
    };
  }
}
