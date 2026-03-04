"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { getSupabaseClient } from "@/lib/supabaseClient";

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: FormDataEntryValue | null): string | null {
  const normalized = asTrimmedString(value);
  return normalized ? normalized : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createNoteAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  const playerId = asTrimmedString(formData.get("playerId"));
  const noteText = asTrimmedString(formData.get("noteText"));
  const seasonId = asNullableString(formData.get("seasonId"));

  if (!playerId || !noteText) {
    throw new Error("Player ID and note text are required.");
  }

  const supabase = getSupabaseClient();
  const actorId = isUuid(sessionUser.id) ? sessionUser.id : null;

  const { error } = await supabase.from("notes").insert({
    player_id: playerId,
    note_text: noteText,
    season_id: seasonId,
    created_by: actorId,
    updated_by: actorId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/players/${playerId}`);
}

export async function updateNoteAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  const playerId = asTrimmedString(formData.get("playerId"));
  const noteId = asTrimmedString(formData.get("noteId"));
  const noteText = asTrimmedString(formData.get("noteText"));
  const seasonId = asNullableString(formData.get("seasonId"));

  if (!playerId || !noteId || !noteText) {
    throw new Error("Player ID, note ID, and note text are required.");
  }

  const supabase = getSupabaseClient();
  const actorId = isUuid(sessionUser.id) ? sessionUser.id : null;

  const { error } = await supabase
    .from("notes")
    .update({ note_text: noteText, season_id: seasonId, updated_by: actorId })
    .eq("id", noteId)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/players/${playerId}`);
}

export async function createAwardAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  const playerId = asTrimmedString(formData.get("playerId"));
  const awardTag = asTrimmedString(formData.get("awardTag"));
  const awardLabel = asTrimmedString(formData.get("awardLabel"));
  const seasonId = asNullableString(formData.get("seasonId"));

  if (!playerId || !awardTag || !awardLabel) {
    throw new Error("Player ID, award tag, and award label are required.");
  }

  const supabase = getSupabaseClient();
  const actorId = isUuid(sessionUser.id) ? sessionUser.id : null;

  const { error } = await supabase.from("awards").insert({
    player_id: playerId,
    award_tag: awardTag,
    award_label: awardLabel,
    season_id: seasonId,
    created_by: actorId,
    updated_by: actorId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/players/${playerId}`);
}

export async function updateAwardAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  const playerId = asTrimmedString(formData.get("playerId"));
  const awardId = asTrimmedString(formData.get("awardId"));
  const awardTag = asTrimmedString(formData.get("awardTag"));
  const awardLabel = asTrimmedString(formData.get("awardLabel"));
  const seasonId = asNullableString(formData.get("seasonId"));

  if (!playerId || !awardId || !awardTag || !awardLabel) {
    throw new Error("Player ID, award ID, award tag, and award label are required.");
  }

  const supabase = getSupabaseClient();
  const actorId = isUuid(sessionUser.id) ? sessionUser.id : null;

  const { error } = await supabase
    .from("awards")
    .update({
      award_tag: awardTag,
      award_label: awardLabel,
      season_id: seasonId,
      updated_by: actorId,
    })
    .eq("id", awardId)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/players/${playerId}`);
}
