import { getSupabaseClient } from "@/lib/supabaseClient";
import { POSITION_GROUPS, PositionGroup } from "@/lib/domain/positions";

export type RosterFilters = {
  seasonId?: string;
  query?: string;
  positionGroup?: PositionGroup;
  sideOfBall?: "offense" | "defense" | "special";
  classYear?: string;
  status?: string;
  state?: string;
  highSchool?: string;
  developmentTag?: string;
};

type SeasonRow = {
  id: string;
  label: string;
  season_year: number;
};

type PlayerRow = {
  id: string;
  full_name: string;
  high_school: string | null;
  state: string | null;
  development_tag: string | null;
  dartmouth_class: string | null;
};

type RosterEntryRow = {
  id: string;
  player_id: string;
  season_id: string;
  position_group: PositionGroup;
  position_detail: string | null;
  class_year: string | null;
  status: string;
  depth_tag: string | null;
  players: PlayerRow | PlayerRow[] | null;
};

type TargetVsActualRow = {
  season_id: string;
  position_group: PositionGroup;
  target_count: number;
  actual_count: number;
  delta: number;
};

export type RosterRow = {
  id: string;
  playerId: string;
  fullName: string;
  positionGroup: PositionGroup;
  positionDetail: string | null;
  classYear: string | null;
  status: string;
  depthTag: string | null;
  highSchool: string | null;
  state: string | null;
  developmentTag: string | null;
  dartmouthClass: string | null;
};

export type TargetSnapshot = {
  positionGroup: PositionGroup;
  targetCount: number;
  actualCount: number;
  delta: number;
};

export type RosterPageData = {
  seasons: SeasonRow[];
  selectedSeasonId: string | null;
  rosterRows: RosterRow[];
  targets: TargetSnapshot[];
  uniqueClassYears: string[];
  uniqueStatuses: string[];
  uniqueStates: string[];
  uniqueHighSchools: string[];
  uniqueDevelopmentTags: string[];
  errorMessage: string | null;
};

const OFFENSE_GROUPS = new Set<PositionGroup>(["QB", "RB", "WR", "TE", "OL"]);
const DEFENSE_GROUPS = new Set<PositionGroup>(["DL", "LB", "DB"]);
const SPECIAL_GROUPS = new Set<PositionGroup>(["SPC"]);

function normalizePlayer(player: PlayerRow | PlayerRow[] | null): PlayerRow | null {
  if (!player) return null;
  if (Array.isArray(player)) return player[0] ?? null;
  return player;
}

function applyInMemoryFilters(rows: RosterRow[], filters: RosterFilters): RosterRow[] {
  return rows.filter((row) => {
    if (filters.sideOfBall === "offense" && !OFFENSE_GROUPS.has(row.positionGroup)) {
      return false;
    }
    if (filters.sideOfBall === "defense" && !DEFENSE_GROUPS.has(row.positionGroup)) {
      return false;
    }
    if (filters.sideOfBall === "special" && !SPECIAL_GROUPS.has(row.positionGroup)) {
      return false;
    }
    if (filters.state && row.state !== filters.state) {
      return false;
    }
    if (filters.highSchool && row.highSchool !== filters.highSchool) {
      return false;
    }
    if (filters.developmentTag && row.developmentTag !== filters.developmentTag) {
      return false;
    }
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const haystack = [
        row.fullName,
        row.positionGroup,
        row.positionDetail ?? "",
        row.highSchool ?? "",
        row.state ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export async function getRosterPageData(filters: RosterFilters): Promise<RosterPageData> {
  try {
    const supabase = await getSupabaseClient();

    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("id,label,season_year")
      .order("season_year", { ascending: false });

    if (seasonError) {
      return {
        seasons: [],
        selectedSeasonId: null,
        rosterRows: [],
        targets: [],
        uniqueClassYears: [],
        uniqueStatuses: [],
        uniqueStates: [],
        uniqueHighSchools: [],
        uniqueDevelopmentTags: [],
        errorMessage: seasonError.message,
      };
    }

    const seasons = (seasonData ?? []) as SeasonRow[];
    const selectedSeasonId = filters.seasonId ?? seasons[0]?.id ?? null;

    if (!selectedSeasonId) {
      return {
        seasons,
        selectedSeasonId: null,
        rosterRows: [],
        targets: [],
        uniqueClassYears: [],
        uniqueStatuses: [],
        uniqueStates: [],
        uniqueHighSchools: [],
        uniqueDevelopmentTags: [],
        errorMessage: null,
      };
    }

    let rosterQuery = supabase
      .from("roster_entries")
      .select(
        "id,player_id,season_id,position_group,position_detail,class_year,status,depth_tag,players(id,full_name,high_school,state,development_tag,dartmouth_class)"
      )
      .eq("season_id", selectedSeasonId)
      .order("position_group", { ascending: true });

    if (filters.positionGroup && POSITION_GROUPS.includes(filters.positionGroup)) {
      rosterQuery = rosterQuery.eq("position_group", filters.positionGroup);
    }
    if (filters.classYear) {
      rosterQuery = rosterQuery.eq("class_year", filters.classYear);
    }
    if (filters.status) {
      rosterQuery = rosterQuery.eq("status", filters.status);
    }

    const { data: rosterData, error: rosterError } = await rosterQuery;

    if (rosterError) {
      return {
        seasons,
        selectedSeasonId,
        rosterRows: [],
        targets: [],
        uniqueClassYears: [],
        uniqueStatuses: [],
        uniqueStates: [],
        uniqueHighSchools: [],
        uniqueDevelopmentTags: [],
        errorMessage: rosterError.message,
      };
    }

    const normalizedRows: RosterRow[] = ((rosterData ?? []) as RosterEntryRow[])
      .map((row) => {
        const player = normalizePlayer(row.players);
        if (!player) return null;

        return {
          id: row.id,
          playerId: row.player_id,
          fullName: player.full_name,
          positionGroup: row.position_group,
          positionDetail: row.position_detail,
          classYear: row.class_year,
          status: row.status,
          depthTag: row.depth_tag,
          highSchool: player.high_school,
          state: player.state,
          developmentTag: player.development_tag,
          dartmouthClass: player.dartmouth_class,
        };
      })
      .filter((row): row is RosterRow => row !== null)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    const filteredRows = applyInMemoryFilters(normalizedRows, filters);

    const { data: targetData, error: targetError } = await supabase
      .from("v_target_vs_actual")
      .select("season_id,position_group,target_count,actual_count,delta")
      .eq("season_id", selectedSeasonId)
      .order("position_group", { ascending: true });

    const targets = targetError
      ? []
      : ((targetData ?? []) as TargetVsActualRow[]).map((row) => ({
          positionGroup: row.position_group,
          targetCount: row.target_count,
          actualCount: row.actual_count,
          delta: row.delta,
        }));

    return {
      seasons,
      selectedSeasonId,
      rosterRows: filteredRows,
      targets,
      uniqueClassYears: unique(normalizedRows.map((row) => row.classYear)),
      uniqueStatuses: unique(normalizedRows.map((row) => row.status)),
      uniqueStates: unique(normalizedRows.map((row) => row.state)),
      uniqueHighSchools: unique(normalizedRows.map((row) => row.highSchool)),
      uniqueDevelopmentTags: unique(normalizedRows.map((row) => row.developmentTag)),
      errorMessage: targetError ? targetError.message : null,
    };
  } catch (error) {
    return {
      seasons: [],
      selectedSeasonId: null,
      rosterRows: [],
      targets: [],
      uniqueClassYears: [],
      uniqueStatuses: [],
      uniqueStates: [],
      uniqueHighSchools: [],
      uniqueDevelopmentTags: [],
      errorMessage: error instanceof Error ? error.message : "Unexpected roster query error",
    };
  }
}
