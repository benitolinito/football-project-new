import { PositionGroup } from "@/lib/domain/positions";
import { getSupabaseClient } from "@/lib/supabaseClient";

type SeasonRow = {
  id: string;
  label: string;
  season_year: number;
};

type TargetVsActualRow = {
  season_id: string;
  position_group: PositionGroup;
  target_count: number;
  actual_count: number;
  delta: number;
};

type RosterCountRow = {
  count: number | null;
};

export type PositionHealth = {
  positionGroup: PositionGroup;
  targetCount: number;
  actualCount: number;
  delta: number;
  status: "under" | "on" | "over";
};

export type DashboardData = {
  seasons: SeasonRow[];
  selectedSeasonId: string | null;
  selectedSeasonLabel: string | null;
  rosterCount: number;
  rosterStatus: "under" | "on" | "over";
  underCount: number;
  onTargetCount: number;
  overCount: number;
  positions: PositionHealth[];
  errorMessage: string | null;
};

function toPositionStatus(delta: number): "under" | "on" | "over" {
  if (delta < 0) return "under";
  if (delta > 0) return "over";
  return "on";
}

function toRosterStatus(rosterCount: number): "under" | "on" | "over" {
  if (rosterCount < 105) return "under";
  if (rosterCount > 110) return "over";
  return "on";
}

export async function getDashboardData(seasonId?: string): Promise<DashboardData> {
  try {
    const supabase = getSupabaseClient();

    const { data: seasonsData, error: seasonsError } = await supabase
      .from("seasons")
      .select("id,label,season_year")
      .order("season_year", { ascending: false });

    if (seasonsError) {
      return {
        seasons: [],
        selectedSeasonId: null,
        selectedSeasonLabel: null,
        rosterCount: 0,
        rosterStatus: "under",
        underCount: 0,
        onTargetCount: 0,
        overCount: 0,
        positions: [],
        errorMessage: seasonsError.message,
      };
    }

    const seasons = (seasonsData ?? []) as SeasonRow[];
    const selectedSeasonId = seasonId ?? seasons[0]?.id ?? null;
    const selectedSeasonLabel = seasons.find((s) => s.id === selectedSeasonId)?.label ?? null;

    if (!selectedSeasonId) {
      return {
        seasons,
        selectedSeasonId: null,
        selectedSeasonLabel: null,
        rosterCount: 0,
        rosterStatus: "under",
        underCount: 0,
        onTargetCount: 0,
        overCount: 0,
        positions: [],
        errorMessage: null,
      };
    }

    const [{ data: targetRows, error: targetError }, { data: rosterCountRows, error: countError }] =
      await Promise.all([
        supabase
          .from("v_target_vs_actual")
          .select("season_id,position_group,target_count,actual_count,delta")
          .eq("season_id", selectedSeasonId)
          .order("position_group", { ascending: true }),
        supabase
          .from("roster_entries")
          .select("id", { count: "exact", head: true })
          .eq("season_id", selectedSeasonId),
      ]);

    if (targetError) {
      return {
        seasons,
        selectedSeasonId,
        selectedSeasonLabel,
        rosterCount: 0,
        rosterStatus: "under",
        underCount: 0,
        onTargetCount: 0,
        overCount: 0,
        positions: [],
        errorMessage: targetError.message,
      };
    }

    if (countError) {
      return {
        seasons,
        selectedSeasonId,
        selectedSeasonLabel,
        rosterCount: 0,
        rosterStatus: "under",
        underCount: 0,
        onTargetCount: 0,
        overCount: 0,
        positions: [],
        errorMessage: countError.message,
      };
    }

    const positions = ((targetRows ?? []) as TargetVsActualRow[]).map((row) => ({
      positionGroup: row.position_group,
      targetCount: row.target_count,
      actualCount: row.actual_count,
      delta: row.delta,
      status: toPositionStatus(row.delta),
    }));

    const underCount = positions.filter((p) => p.status === "under").length;
    const onTargetCount = positions.filter((p) => p.status === "on").length;
    const overCount = positions.filter((p) => p.status === "over").length;

    const rosterCount = (rosterCountRows as unknown as RosterCountRow | null)?.count ?? 0;

    return {
      seasons,
      selectedSeasonId,
      selectedSeasonLabel,
      rosterCount,
      rosterStatus: toRosterStatus(rosterCount),
      underCount,
      onTargetCount,
      overCount,
      positions,
      errorMessage: null,
    };
  } catch (error) {
    return {
      seasons: [],
      selectedSeasonId: null,
      selectedSeasonLabel: null,
      rosterCount: 0,
      rosterStatus: "under",
      underCount: 0,
      onTargetCount: 0,
      overCount: 0,
      positions: [],
      errorMessage: error instanceof Error ? error.message : "Unexpected dashboard query error",
    };
  }
}
