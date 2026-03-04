import { Role } from "@/lib/domain/models";
import { getSupabaseClient } from "@/lib/supabaseClient";

type SessionUser = {
  id: string;
  email: string;
  role: Role;
};

type ProfileRow = {
  role: Role;
  email: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role,email")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as ProfileRow | null;
  const role: Role = profile?.role === "admin" ? "admin" : "staff";

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? "unknown@dartmouth.edu",
    role,
  };
}
