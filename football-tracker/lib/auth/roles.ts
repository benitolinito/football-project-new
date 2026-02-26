import { Role } from "@/lib/domain/models";

export function canManageUsers(role: Role): boolean {
  return role === "admin";
}

export function canEditPersonnel(role: Role): boolean {
  return role === "admin" || role === "staff";
}
