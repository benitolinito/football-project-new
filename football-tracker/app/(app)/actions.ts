"use server";

import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function signOutAction(): Promise<void> {
  const supabase = await getSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
