"use server";

import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

function asTrimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = asTrimmedString(formData.get("email"));
  const password = asTrimmedString(formData.get("password"));
  const nextPath = asTrimmedString(formData.get("next")) || "/dashboard";

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}
