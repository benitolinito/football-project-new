"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { POSITION_GROUPS, PositionGroup } from "@/lib/domain/positions";
import { getSupabaseClient } from "@/lib/supabaseClient";

const STATUS_OPTIONS = new Set(["active", "redshirt", "injured", "departed", "graduated"]);

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: FormDataEntryValue | null): string | null {
  const normalized = asTrimmedString(value);
  return normalized ? normalized : null;
}

function isPositionGroup(value: string): value is PositionGroup {
  return POSITION_GROUPS.includes(value as PositionGroup);
}

function isStatus(value: string): boolean {
  return STATUS_OPTIONS.has(value);
}

export async function createScenarioAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const name = asTrimmedString(formData.get("name"));
  const baseSeasonId = asTrimmedString(formData.get("baseSeasonId"));

  if (!name || !baseSeasonId) {
    throw new Error("Scenario name and base season are required.");
  }

  const supabase = await getSupabaseClient();

  const { data: scenarioInsert, error: scenarioError } = await supabase
    .from("scenarios")
    .insert({
      name,
      base_season_id: baseSeasonId,
      created_by: sessionUser.id,
      updated_by: sessionUser.id,
    })
    .select("id")
    .single();

  if (scenarioError || !scenarioInsert) {
    throw new Error(scenarioError?.message ?? "Failed to create scenario.");
  }

  const scenarioId = scenarioInsert.id as string;

  const [{ data: baseRosterRows, error: baseRosterError }, { data: baseTargetRows, error: baseTargetError }] =
    await Promise.all([
      supabase
        .from("roster_entries")
        .select("player_id,position_group,position_detail,class_year,status,depth_tag")
        .eq("season_id", baseSeasonId),
      supabase
        .from("position_targets")
        .select("position_group,target_count")
        .eq("season_id", baseSeasonId),
    ]);

  if (baseRosterError) {
    throw new Error(baseRosterError.message);
  }

  if (baseTargetError) {
    throw new Error(baseTargetError.message);
  }

  const rosterPayload = (baseRosterRows ?? []).map((row) => ({
    scenario_id: scenarioId,
    player_id: row.player_id,
    position_group: row.position_group,
    position_detail: row.position_detail,
    class_year: row.class_year,
    status: row.status,
    depth_tag: row.depth_tag,
    created_by: sessionUser.id,
    updated_by: sessionUser.id,
  }));

  if (rosterPayload.length > 0) {
    const { error: rosterInsertError } = await supabase
      .from("scenario_roster_entries")
      .insert(rosterPayload);

    if (rosterInsertError) {
      throw new Error(rosterInsertError.message);
    }
  }

  const targetsPayload = (baseTargetRows ?? []).map((row) => ({
    scenario_id: scenarioId,
    position_group: row.position_group,
    target_count: row.target_count,
    created_by: sessionUser.id,
    updated_by: sessionUser.id,
  }));

  if (targetsPayload.length > 0) {
    const { error: targetInsertError } = await supabase.from("scenario_targets").insert(targetsPayload);

    if (targetInsertError) {
      throw new Error(targetInsertError.message);
    }
  }

  revalidatePath("/scenarios");
}

export async function updateScenarioTargetAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const scenarioId = asTrimmedString(formData.get("scenarioId"));
  const scenarioTargetId = asTrimmedString(formData.get("scenarioTargetId"));
  const targetCountRaw = asTrimmedString(formData.get("targetCount"));
  const targetCount = Number(targetCountRaw);

  if (!scenarioId || !scenarioTargetId || Number.isNaN(targetCount) || targetCount < 0) {
    throw new Error("Scenario target update payload is invalid.");
  }

  const supabase = await getSupabaseClient();

  const { error } = await supabase
    .from("scenario_targets")
    .update({ target_count: targetCount, updated_by: sessionUser.id })
    .eq("id", scenarioTargetId)
    .eq("scenario_id", scenarioId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/scenarios");
}

export async function updateScenarioRosterEntryAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  const scenarioId = asTrimmedString(formData.get("scenarioId"));
  const scenarioRosterEntryId = asTrimmedString(formData.get("scenarioRosterEntryId"));
  const positionGroupRaw = asTrimmedString(formData.get("positionGroup"));
  const status = asTrimmedString(formData.get("status"));
  const positionDetail = asNullableString(formData.get("positionDetail"));
  const classYear = asNullableString(formData.get("classYear"));
  const depthTag = asNullableString(formData.get("depthTag"));

  if (!scenarioId || !scenarioRosterEntryId || !isPositionGroup(positionGroupRaw) || !isStatus(status)) {
    throw new Error("Scenario roster update payload is invalid.");
  }

  const supabase = await getSupabaseClient();

  const { error } = await supabase
    .from("scenario_roster_entries")
    .update({
      position_group: positionGroupRaw,
      status,
      position_detail: positionDetail,
      class_year: classYear,
      depth_tag: depthTag,
      updated_by: sessionUser.id,
    })
    .eq("id", scenarioRosterEntryId)
    .eq("scenario_id", scenarioId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/scenarios");
}
