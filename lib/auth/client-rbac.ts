import { ROLE_PERMISSIONS } from "./roles";
import type { Permission } from "./permissions";

export function hasPermission(role: string, permission: Permission): boolean {
  if (!role) return false;
  const permissionsForRole = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  if (!permissionsForRole) return false;
  return (permissionsForRole as string[]).includes(permission);
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
