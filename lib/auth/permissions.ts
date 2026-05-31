// lib/auth/permissions.ts

export const PERMISSIONS = {
  students: {
    view: 'students.view',
    create: 'students.create',
    update: 'students.update',
    delete: 'students.delete',
  },

  staff: {
    view: 'staff.view',
    create: 'staff.create',
    update: 'staff.update',
    delete: 'staff.delete',
  },

  fees: {
    view: 'fees.view',
    create: 'fees.create',
    update: 'fees.update',
    delete: 'fees.delete',
  },

  attendance: {
    view: 'attendance.view',
    create: 'attendance.create',
    update: 'attendance.update',
    delete: 'attendance.delete',
  },

  parents: {
    view: 'parents.view',
    manage: 'parents.manage',
  },

  dashboard: {
    view: 'dashboard.view',
  },

  settings: {
    view: 'settings.view',
    manage: 'settings.manage',
  },

  billing: {
    view: 'billing.view',
    manage: 'billing.manage',
  },

  audit: {
    view: 'audit.view',
  },
} as const;

// -------------------------------------------------------
// Permission type – explicit union per module
// -------------------------------------------------------
type PermissionModule = typeof PERMISSIONS;

export type Permission =
  | PermissionModule["students"][keyof PermissionModule["students"]]
  | PermissionModule["staff"][keyof PermissionModule["staff"]]
  | PermissionModule["fees"][keyof PermissionModule["fees"]]
  | PermissionModule["attendance"][keyof PermissionModule["attendance"]]
  | PermissionModule["parents"][keyof PermissionModule["parents"]]
  | PermissionModule["dashboard"][keyof PermissionModule["dashboard"]]
  | PermissionModule["settings"][keyof PermissionModule["settings"]]
  | PermissionModule["billing"][keyof PermissionModule["billing"]]
  | PermissionModule["audit"][keyof PermissionModule["audit"]];

// -------------------------------------------------------
// Role → permission mapping
// -------------------------------------------------------
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    ...Object.values(PERMISSIONS).flatMap((module) =>
      Object.values(module)
    ),
  ] as Permission[],

  teacher: [
    PERMISSIONS.students.view,
    PERMISSIONS.attendance.view,
    PERMISSIONS.attendance.create,
    PERMISSIONS.dashboard.view,
  ],

  accountant: [
    PERMISSIONS.fees.view,
    PERMISSIONS.fees.create,
    PERMISSIONS.fees.update,
    PERMISSIONS.billing.view,
  ],

  parent: [
    PERMISSIONS.parents.view,
    PERMISSIONS.parents.manage,
  ],
};
