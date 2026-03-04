import { getSupabaseClient } from "@/lib/supabaseClient";

type SearchParams = {
  query?: string;
  state?: string;
  highSchool?: string;
  developmentTag?: string;
};

type PlayerRow = {
  id: string;
  full_name: string;
  photo_url: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  high_school: string | null;
  state: string | null;
  dartmouth_class: string | null;
  development_tag: string | null;
  games_played: number | null;
  games_started: number | null;
  eval_text: string | null;
};

type NoteRow = {
  id: string;
  note_text: string;
  created_at: string;
  season_id: string | null;
};

type AwardRow = {
  id: string;
  award_tag: string;
  award_label: string;
  created_at: string;
  season_id: string | null;
};

type SeasonRow = {
  id: string;
  label: string;
};

export type PlayerListRow = {
  id: string;
  fullName: string;
  highSchool: string | null;
  state: string | null;
  developmentTag: string | null;
  dartmouthClass: string | null;
};

export type PlayersListData = {
  players: PlayerListRow[];
  uniqueStates: string[];
  uniqueHighSchools: string[];
  uniqueDevelopmentTags: string[];
  errorMessage: string | null;
};

export type PlayerProfileData = {
  player: {
    id: string;
    fullName: string;
    photoUrl: string | null;
    heightInches: number | null;
    weightLbs: number | null;
    highSchool: string | null;
    state: string | null;
    dartmouthClass: string | null;
    developmentTag: string | null;
    gamesPlayed: number | null;
    gamesStarted: number | null;
    evalText: string | null;
  } | null;
  notes: Array<{
    id: string;
    noteText: string;
    createdAt: string;
    seasonId: string | null;
    seasonLabel: string | null;
  }>;
  awards: Array<{
    id: string;
    awardTag: string;
    awardLabel: string;
    createdAt: string;
    seasonId: string | null;
    seasonLabel: string | null;
  }>;
  seasons: Array<{
    id: string;
    label: string;
  }>;
  errorMessage: string | null;
};

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export async function getPlayersListData(filters: SearchParams): Promise<PlayersListData> {
  try {
    const supabase = getSupabaseClient();

    let query = supabase
      .from("players")
      .select(
        "id,full_name,high_school,state,development_tag,dartmouth_class",
        { count: "exact" }
      )
      .order("full_name", { ascending: true });

    if (filters.state) {
      query = query.eq("state", filters.state);
    }
    if (filters.highSchool) {
      query = query.eq("high_school", filters.highSchool);
    }
    if (filters.developmentTag) {
      query = query.eq("development_tag", filters.developmentTag);
    }
    if (filters.query) {
      query = query.or(
        `full_name.ilike.%${filters.query}%,high_school.ilike.%${filters.query}%,state.ilike.%${filters.query}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return {
        players: [],
        uniqueStates: [],
        uniqueHighSchools: [],
        uniqueDevelopmentTags: [],
        errorMessage: error.message,
      };
    }

    const rows = (data ?? []) as PlayerRow[];

    return {
      players: rows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        highSchool: row.high_school,
        state: row.state,
        developmentTag: row.development_tag,
        dartmouthClass: row.dartmouth_class,
      })),
      uniqueStates: unique(rows.map((row) => row.state)),
      uniqueHighSchools: unique(rows.map((row) => row.high_school)),
      uniqueDevelopmentTags: unique(rows.map((row) => row.development_tag)),
      errorMessage: null,
    };
  } catch (error) {
    return {
      players: [],
      uniqueStates: [],
      uniqueHighSchools: [],
      uniqueDevelopmentTags: [],
      errorMessage: error instanceof Error ? error.message : "Unexpected players query error",
    };
  }
}

export async function getPlayerProfileData(playerId: string): Promise<PlayerProfileData> {
  try {
    const supabase = getSupabaseClient();

    const [{ data: playerData, error: playerError }, { data: seasonsData }] = await Promise.all([
      supabase
        .from("players")
        .select(
          "id,full_name,photo_url,height_inches,weight_lbs,high_school,state,dartmouth_class,development_tag,games_played,games_started,eval_text"
        )
        .eq("id", playerId)
        .maybeSingle(),
      supabase.from("seasons").select("id,label"),
    ]);

    if (playerError) {
      return {
        player: null,
        notes: [],
        awards: [],
        seasons: [],
        errorMessage: playerError.message,
      };
    }

    if (!playerData) {
      return {
        player: null,
        notes: [],
        awards: [],
        seasons: [],
        errorMessage: null,
      };
    }

    const seasonMap = new Map<string, string>(
      ((seasonsData ?? []) as SeasonRow[]).map((season) => [season.id, season.label])
    );

    const [{ data: notesData, error: notesError }, { data: awardsData, error: awardsError }] =
      await Promise.all([
        supabase
          .from("notes")
          .select("id,note_text,created_at,season_id")
          .eq("player_id", playerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("awards")
          .select("id,award_tag,award_label,created_at,season_id")
          .eq("player_id", playerId)
          .order("created_at", { ascending: false }),
      ]);

    if (notesError) {
      return {
        player: null,
        notes: [],
        awards: [],
        seasons: [],
        errorMessage: notesError.message,
      };
    }

    if (awardsError) {
      return {
        player: null,
        notes: [],
        awards: [],
        seasons: [],
        errorMessage: awardsError.message,
      };
    }

    return {
      player: {
        id: playerData.id,
        fullName: playerData.full_name,
        photoUrl: playerData.photo_url,
        heightInches: playerData.height_inches,
        weightLbs: playerData.weight_lbs,
        highSchool: playerData.high_school,
        state: playerData.state,
        dartmouthClass: playerData.dartmouth_class,
        developmentTag: playerData.development_tag,
        gamesPlayed: playerData.games_played,
        gamesStarted: playerData.games_started,
        evalText: playerData.eval_text,
      },
      notes: ((notesData ?? []) as NoteRow[]).map((note) => ({
        id: note.id,
        noteText: note.note_text,
        createdAt: note.created_at,
        seasonId: note.season_id,
        seasonLabel: note.season_id ? seasonMap.get(note.season_id) ?? null : null,
      })),
      awards: ((awardsData ?? []) as AwardRow[]).map((award) => ({
        id: award.id,
        awardTag: award.award_tag,
        awardLabel: award.award_label,
        createdAt: award.created_at,
        seasonId: award.season_id,
        seasonLabel: award.season_id ? seasonMap.get(award.season_id) ?? null : null,
      })),
      seasons: (seasonsData ?? []).map((season) => ({
        id: season.id,
        label: season.label,
      })),
      errorMessage: null,
    };
  } catch (error) {
    return {
      player: null,
      notes: [],
      awards: [],
      seasons: [],
      errorMessage: error instanceof Error ? error.message : "Unexpected player profile query error",
    };
  }
}
