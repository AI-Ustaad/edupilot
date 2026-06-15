import { ROLE_PERMISSIONS, Role } from "./roles";
import type { Permission } from "./permissions";

/**
 * چیک کرتا ہے کہ آیا دیے گئے Role کے پاس مخصوص Permission ہے یا نہیں
 */
export function hasPermission(role: string, permission: Permission): boolean {
  if (!role) return false;
  
  const permissionsForRole = ROLE_PERMISSIONS[role];
  if (!permissionsForRole) return false;

  return permissionsForRole.includes(permission);
}

/**
 * چیک کرتا ہے کہ آیا دیے گئے Role کے پاس دی گئی پرمیشنز میں سے کوئی ایک بھی ہے یا نہیں
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * چیک کرتا ہے کہ آیا دیے گئے Role کے پاس تمام دی گئی پرمیشنز موجود ہیں یا نہیں
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
