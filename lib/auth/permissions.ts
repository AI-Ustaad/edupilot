// lib/auth/permissions.ts
export type Role = "admin" | "teacher" | "accountant" | "parent";

export type Permission =
  | "student.create"
  | "student.view"
  | "student.delete"
  | "staff.view"
  | "staff.manage"
  | "staff.read"
  | "staff.write"
  | "attendance.mark"
  | "attendance.read"
  | "attendance.write"
  | "fees.view"
  | "fees.read"
  | "fees.write"
  | "fees.create"
  | "fees.manage"
  | "dashboard.view"
  | "analytics.view"
  | "parent.view"
  | "parent.manage";

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "student.create", "student.view", "student.delete",
    "staff.view", "staff.manage", "staff.read", "staff.write",
    "attendance.mark", "attendance.read", "attendance.write",
    "fees.view", "fees.read", "fees.write", "fees.create", "fees.manage",
    "dashboard.view", "analytics.view",
    "parent.view", "parent.manage",
  ],
  teacher: [
    "student.view",
    "attendance.mark", "attendance.read", "attendance.write",
    "dashboard.view",
  ],
  accountant: [
    "fees.view", "fees.read", "fees.write", "fees.create",
    "dashboard.view", "analytics.view",
  ],
  parent: [
    "student.view",
    "attendance.read",
    "fees.view",
    "dashboard.view",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}
