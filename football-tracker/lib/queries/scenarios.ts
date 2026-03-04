import { POSITION_GROUPS, PositionGroup } from "@/lib/domain/positions";
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
  archived_at: string | null;
};

type ScenarioTargetRow = {
  id: string;
  scenario_id: string;
  position_group: PositionGroup;
  target_count: number;
};

type PositionTargetRow = {
  position_group: PositionGroup;
  target_count: number;
};

type RosterEntryCountRow = {
  position_group: PositionGroup;
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
  archivedAt: string | null;
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

export type ScenarioPositionComparison = {
  positionGroup: PositionGroup;
  officialTarget: number;
  officialActual: number;
  scenarioTarget: number;
  scenarioActual: number;
  targetDelta: number;
  headcountDelta: number;
};

export type ScenarioDetail = {
  id: string;
  name: string;
  baseSeasonId: string;
  baseSeasonLabel: string;
  createdAt: string;
  archivedAt: string | null;
  targets: ScenarioTarget[];
  rosterEntries: ScenarioRosterEntry[];
  officialRosterCount: number;
  scenarioRosterCount: number;
  headcountDelta: number;
  positionComparison: ScenarioPositionComparison[];
};

export type ScenariosPageData = {
  seasons: Array<{ id: string; label: string }>;
  scenarios: ScenarioSummary[];
  selectedScenario: ScenarioDetail | null;
  selectedScenarioId: string | null;
  showArchived: boolean;
  errorMessage: string | null;
};

function normalizePlayer(player: PlayerRow | PlayerRow[] | null): PlayerRow | null {
  if (!player) return null;
  if (Array.isArray(player)) return player[0] ?? null;
  return player;
}

function countByPosition(rows: Array<{ position_group: PositionGroup }>): Record<PositionGroup, number> {
  const counts = Object.fromEntries(POSITION_GROUPS.map((group) => [group, 0])) as Record<
    PositionGroup,
    number
  >;

  for (const row of rows) {
    counts[row.position_group] = (counts[row.position_group] ?? 0) + 1;
  }

  return counts;
}

export async function getScenariosPageData(
  selectedScenarioId?: string,
  showArchived = false
): Promise<ScenariosPageData> {
  try {
    const supabase = await getSupabaseClient();

    const [{ data: seasonsData, error: seasonsError }, scenariosResult] = await Promise.all([
      supabase
        .from("seasons")
        .select("id,label,season_year")
        .order("season_year", { ascending: false }),
      (showArchived
        ? supabase
            .from("scenarios")
            .select("id,name,base_season_id,created_at,created_by,archived_at")
            .order("created_at", { ascending: false })
        : supabase
            .from("scenarios")
            .select("id,name,base_season_id,created_at,created_by,archived_at")
            .is("archived_at", null)
            .order("created_at", { ascending: false })),
    ]);

    const { data: scenariosData, error: scenariosError } = scenariosResult;

    if (seasonsError) {
      return {
        seasons: [],
        scenarios: [],
        selectedScenario: null,
        selectedScenarioId: null,
        showArchived,
        errorMessage: seasonsError.message,
      };
    }

    if (scenariosError) {
      return {
        seasons: (seasonsData ?? []).map((season) => ({ id: season.id, label: season.label })),
        scenarios: [],
        selectedScenario: null,
        selectedScenarioId: null,
        showArchived,
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
      archivedAt: scenario.archived_at,
    }));

    const effectiveScenarioId = selectedScenarioId ?? scenarios[0]?.id ?? null;

    if (!effectiveScenarioId) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: null,
        showArchived,
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
        showArchived,
        errorMessage: null,
      };
    }

    const [scenarioTargetResult, scenarioRosterResult, officialTargetResult, officialRosterResult] =
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
        supabase
          .from("position_targets")
          .select("position_group,target_count")
          .eq("season_id", selectedScenarioSummary.baseSeasonId),
        supabase
          .from("roster_entries")
          .select("position_group")
          .eq("season_id", selectedScenarioSummary.baseSeasonId),
      ]);

    if (scenarioTargetResult.error) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: effectiveScenarioId,
        showArchived,
        errorMessage: scenarioTargetResult.error.message,
      };
    }

    if (scenarioRosterResult.error) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: effectiveScenarioId,
        showArchived,
        errorMessage: scenarioRosterResult.error.message,
      };
    }

    if (officialTargetResult.error) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: effectiveScenarioId,
        showArchived,
        errorMessage: officialTargetResult.error.message,
      };
    }

    if (officialRosterResult.error) {
      return {
        seasons: seasons.map((season) => ({ id: season.id, label: season.label })),
        scenarios,
        selectedScenario: null,
        selectedScenarioId: effectiveScenarioId,
        showArchived,
        errorMessage: officialRosterResult.error.message,
      };
    }

    const scenarioTargetRows = (scenarioTargetResult.data ?? []) as ScenarioTargetRow[];
    const officialTargetRows = (officialTargetResult.data ?? []) as PositionTargetRow[];

    const normalizedRoster = ((scenarioRosterResult.data ?? []) as ScenarioRosterRow[])
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

    const scenarioActualCounts = normalizedRoster.reduce<Record<PositionGroup, number>>(
      (acc, row) => {
        acc[row.positionGroup] = (acc[row.positionGroup] ?? 0) + 1;
        return acc;
      },
      Object.fromEntries(POSITION_GROUPS.map((group) => [group, 0])) as Record<PositionGroup, number>
    );

    const officialActualCounts = countByPosition(
      (officialRosterResult.data ?? []) as RosterEntryCountRow[]
    );

    const officialTargetMap = Object.fromEntries(
      POSITION_GROUPS.map((group) => [group, 0])
    ) as Record<PositionGroup, number>;
    for (const row of officialTargetRows) {
      officialTargetMap[row.position_group] = row.target_count;
    }

    const scenarioTargetMap = Object.fromEntries(
      POSITION_GROUPS.map((group) => [group, 0])
    ) as Record<PositionGroup, number>;
    for (const row of scenarioTargetRows) {
      scenarioTargetMap[row.position_group] = row.target_count;
    }

    const targets = scenarioTargetRows.map((row) => {
      const actualCount = scenarioActualCounts[row.position_group] ?? 0;
      return {
        id: row.id,
        positionGroup: row.position_group,
        targetCount: row.target_count,
        actualCount,
        delta: actualCount - row.target_count,
      };
    });

    const positionComparison = POSITION_GROUPS.map((positionGroup) => ({
      positionGroup,
      officialTarget: officialTargetMap[positionGroup] ?? 0,
      officialActual: officialActualCounts[positionGroup] ?? 0,
      scenarioTarget: scenarioTargetMap[positionGroup] ?? 0,
      scenarioActual: scenarioActualCounts[positionGroup] ?? 0,
      targetDelta: (scenarioTargetMap[positionGroup] ?? 0) - (officialTargetMap[positionGroup] ?? 0),
      headcountDelta:
        (scenarioActualCounts[positionGroup] ?? 0) - (officialActualCounts[positionGroup] ?? 0),
    }));

    const scenarioRosterCount = normalizedRoster.length;
    const officialRosterCount = ((officialRosterResult.data ?? []) as RosterEntryCountRow[]).length;

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
        archivedAt: selectedScenarioSummary.archivedAt,
        targets,
        rosterEntries: normalizedRoster,
        officialRosterCount,
        scenarioRosterCount,
        headcountDelta: scenarioRosterCount - officialRosterCount,
        positionComparison,
      },
      showArchived,
      errorMessage: null,
    };
  } catch (error) {
    return {
      seasons: [],
      scenarios: [],
      selectedScenario: null,
      selectedScenarioId: null,
      showArchived,
      errorMessage: error instanceof Error ? error.message : "Unexpected scenarios query error",
    };
  }
}
