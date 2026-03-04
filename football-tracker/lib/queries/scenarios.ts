import { PositionGroup } from "@/lib/domain/positions";
import { getSupabaseClient } from "@/lib/supabaseClient";

type SeasonRow = {
  id: string;
  label: string;
  season_year: number;
};

type ScenarioRow = {
  id: string;
  name: string;
  base_season_id: string;
  created_at: string;
  created_by: string | null;
};

type ScenarioTargetRow = {
  id: string;
  scenario_id: string;
  position_group: PositionGroup;
  target_count: number;
};

type PlayerRow = {
  id: string;
  full_name: string;
};

type ScenarioRosterRow = {
  id: string;
  scenario_id: string;
  player_id: string;
  position_group: PositionGroup;
  position_detail: string | null;
  class_year: string | null;
  status: string;
  depth_tag: string | null;
  players: PlayerRow | PlayerRow[] | null;
};

export type ScenarioSummary = {
  id: string;
  name: string;
  baseSeasonId: string;
  baseSeasonLabel: string;
  createdAt: string;
  createdBy: string | null;
};

export type ScenarioTarget = {
  id: string;
  positionGroup: PositionGroup;
  targetCount: number;
  actualCount: number;
  delta: number;
};

export type ScenarioRosterEntry = {
  id: string;
  playerId: string;
  playerName: string;
  positionGroup: PositionGroup;
  positionDetail: string | null;
  classYear: string | null;
  status: string;
  depthTag: string | null;
};

export type ScenarioDetail = {
  id: string;
  name: string;
  baseSeasonId: string;
  baseSeasonLabel: string;
  createdAt: string;
  targets: ScenarioTarget[];
  rosterEntries: ScenarioRosterEntry[];
};

export type ScenariosPageData = {
  seasons: Array<{ id: string; label: string }>;
  scenarios: ScenarioSummary[];
  selectedScenario: ScenarioDetail | null;
  selectedScenarioId: string | null;
  errorMessage: string | null;
};

function normalizePlayer(player: PlayerRow | PlayerRow[] | null): PlayerRow | null {
  if (!player) return null;
  if (Array.isArray(player)) return player[0] ?? null;
  return player;
}

export async function getScenariosPageData(selectedScenarioId?: string): Promise<ScenariosPageData> {
  try {
    const supabase = await getSupabaseClient();

    const [{ data: seasonsData, error: seasonsError }, { data: scenariosData, error: scenariosError }] =
      await Promise.all([
        supabase
          .from("seasons")
          .select("id,label,season_year")
          .order("season_year", { ascending: false }),
        supabase
          .from("scenarios")
          .select("id,name,base_season_id,created_at,created_by")
          .order("created_at", { ascending: false }),
      ]);

    if (seasonsError) {
      return {
        seasons: [],
        scenarios: [],
        selectedScenario: null,
        selectedScenarioId: null,
        errorMessage: seasonsError.message,
      };
    }

    if (scenariosError) {
      return {
        seasons: (seasonsData ?? []).map((season) => ({ id: season.id, label: season.label })),
        scenarios: [],
        selectedScenario: null,
        selectedScenarioId: null,
        errorMessage: scenariosError.message,
      };
    }

    const seasons = (seasonsData ?? []) as SeasonRow[];
    const seasonMap = new Map(seasons.map((season) => [season.id, season.label]));

    const scenarios = ((scenariosData ?? []) as ScenarioRow[]).map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      baseSeasonId: scenario.base_season_id,
      baseSeasonLabel: seasonMap.get(scenario.base_season_id) ?? "Unknown season",
      createdAt: scenario.created_at,
      createdBy: scenario.created_by,
    }));

    const effectiveScenarioId = selectedScenarioId ?? scenarios[0]?.id ?? null;

    if (!effectiveScenarioId) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: null,
        errorMessage: null,
      };
    }

    const selectedScenarioSummary = scenarios.find((scenario) => scenario.id === effectiveScenarioId);
    if (!selectedScenarioSummary) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: null,
        errorMessage: null,
      };
    }

    const [{ data: targetRows, error: targetsError }, { data: rosterRows, error: rosterError }] =
      await Promise.all([
        supabase
          .from("scenario_targets")
          .select("id,scenario_id,position_group,target_count")
          .eq("scenario_id", effectiveScenarioId)
          .order("position_group", { ascending: true }),
        supabase
          .from("scenario_roster_entries")
          .select(
            "id,scenario_id,player_id,position_group,position_detail,class_year,status,depth_tag,players(id,full_name)"
          )
          .eq("scenario_id", effectiveScenarioId),
      ]);

    if (targetsError) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: effectiveScenarioId,
        errorMessage: targetsError.message,
      };
    }

    if (rosterError) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: effectiveScenarioId,
        errorMessage: rosterError.message,
      };
    }

    const normalizedRoster = ((rosterRows ?? []) as ScenarioRosterRow[])
      .map((row) => {
        const player = normalizePlayer(row.players);
        if (!player) return null;

        return {
          id: row.id,
          playerId: row.player_id,
          playerName: player.full_name,
          positionGroup: row.position_group,
          positionDetail: row.position_detail,
          classYear: row.class_year,
          status: row.status,
          depthTag: row.depth_tag,
        };
      })
      .filter((row): row is ScenarioRosterEntry => row !== null)
      .sort((a, b) => {
        const byPos = a.positionGroup.localeCompare(b.positionGroup);
        if (byPos !== 0) return byPos;
        return a.playerName.localeCompare(b.playerName);
      });

    const actualCounts = normalizedRoster.reduce<Record<string, number>>((acc, row) => {
      acc[row.positionGroup] = (acc[row.positionGroup] ?? 0) + 1;
      return acc;
    }, {});

    const targets = ((targetRows ?? []) as ScenarioTargetRow[]).map((row) => {
      const actualCount = actualCounts[row.position_group] ?? 0;
      return {
        id: row.id,
        positionGroup: row.position_group,
        targetCount: row.target_count,
        actualCount,
        delta: actualCount - row.target_count,
      };
    });

    return {
      seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
      scenarios,
      selectedScenarioId: effectiveScenarioId,
      selectedScenario: {
        id: selectedScenarioSummary.id,
        name: selectedScenarioSummary.name,
        baseSeasonId: selectedScenarioSummary.baseSeasonId,
        baseSeasonLabel: selectedScenarioSummary.baseSeasonLabel,
        createdAt: selectedScenarioSummary.createdAt,
        targets,
        rosterEntries: normalizedRoster,
      },
      errorMessage: null,
    };
  } catch (error) {
    return {
      seasons: [],
      scenarios: [],
      selectedScenario: null,
      selectedScenarioId: null,
      errorMessage: error instanceof Error ? error.message : "Unexpected scenarios query error",
    };
  }
}
