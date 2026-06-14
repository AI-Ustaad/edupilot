export const PERMISSIONS = {
  STUDENTS: {
    VIEW: 'students.view',
    CREATE: 'students.create',
    UPDATE: 'students.update',
    DELETE: 'students.delete',
    EXPORT: 'students.export',
  },
  STAFF: {
    VIEW: 'staff.view',
    CREATE: 'staff.create',
    UPDATE: 'staff.update',
    DELETE: 'staff.delete',
  },
  FEES: {
    VIEW: 'fees.view',
    CREATE: 'fees.create',
    UPDATE: 'fees.update',
    DELETE: 'fees.delete',
    APPROVE: 'fees.approve',
  },
  ATTENDANCE: {
    VIEW: 'attendance.view',
    MARK: 'attendance.mark',
    UPDATE: 'attendance.update',
    DELETE: 'attendance.delete',
  },
  EXAMS: {
    VIEW: 'exams.view',
    CREATE: 'exams.create',
    PUBLISH: 'exams.publish',
  },
  PARENTS: {
    VIEW: 'parents.view',
    MANAGE: 'parents.manage',
  },
  DASHBOARD: {
    VIEW: 'dashboard.view',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    MANAGE: 'settings.manage', // ✅ یہ لائن بہت اہم ہے
    UPDATE: 'settings.update',
  },
  BILLING: {
    VIEW: 'billing.view',
    MANAGE: 'billing.manage',
  },
  AUDIT: {
    VIEW: 'audit.view',
  },
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    ...Object.values(PERMISSIONS).flatMap(module => Object.values(module)),
  ],
  teacher: [
    PERMISSIONS.STUDENTS.VIEW,
    PERMISSIONS.ATTENDANCE.VIEW,
    PERMISSIONS.ATTENDANCE.MARK,
    PERMISSIONS.DASHBOARD.VIEW,
  ],
  accountant: [
    PERMISSIONS.FEES.VIEW,
    PERMISSIONS.FEES.CREATE,
    PERMISSIONS.FEES.UPDATE,
    PERMISSIONS.BILLING.VIEW,
  ],
  parent: [
    PERMISSIONS.PARENTS.VIEW,
    PERMISSIONS.PARENTS.MANAGE,
  ],
};
