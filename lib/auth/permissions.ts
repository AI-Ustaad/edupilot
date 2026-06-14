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
  },
  EXAMS: {
    VIEW: 'exams.view',
    CREATE: 'exams.create',
    PUBLISH: 'exams.publish',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    UPDATE: 'settings.update',
  },
  AUDIT: {
    VIEW: 'audit.view',
  },
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Helper to get all permissions for a module (e.g., 'students.*')
export const getModulePermissions = (module: keyof typeof PERMISSIONS): string[] => {
  return Object.values(PERMISSIONS[module]);
};
