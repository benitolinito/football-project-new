import { Role } from "@/lib/domain/models";

type SessionUser = {
  id: string;
  email: string;
  role: Role;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const devRole = process.env.NEXT_PUBLIC_DEV_ROLE;

  if (devRole === "admin" || devRole === "staff") {
    return {
      id: "local-dev-user",
      email: "dev@dartmouth.edu",
      role: devRole,
    };
  }

  return null;
}
