import { ROLE_PERMISSIONS } from '@/lib/auth/roles';
import { hasAnyPermission } from '@/lib/auth/client-rbac';

describe('ROLE_PERMISSIONS', () => {
  // B11 rework (27 Nov): PR #20 gated POST /api/v1/syllabus on
  // PERMISSIONS.syllabus.create, but no role held any syllabus.* permission,
  // so even ADMIN got 403 "Forbidden: Insufficient permissions" on save.
  // The permission check must pass for the admin role (and its aliases).
  test.each(['admin', 'schoolAdmin', 'superAdmin', 'super_admin'])(
    '%s can create syllabus material (B11 rework)',
    (role) => {
      expect(ROLE_PERMISSIONS[role]).toContain('syllabus.view');
      expect(ROLE_PERMISSIONS[role]).toContain('syllabus.create');
      expect(ROLE_PERMISSIONS[role]).toContain('syllabus.update');
      expect(ROLE_PERMISSIONS[role]).toContain('syllabus.delete');
      expect(hasAnyPermission(role, ['syllabus.create'])).toBe(true);
    }
  );
  test.each(['schoolAdmin', 'superAdmin', 'super_admin'])('%s receives the canonical administrator permissions', (role) => {
    expect(ROLE_PERMISSIONS[role]).toEqual(ROLE_PERMISSIONS.admin);
    expect(ROLE_PERMISSIONS[role]).toContain('settings.manage');
    expect(ROLE_PERMISSIONS[role]).toContain('settings.update');
    expect(ROLE_PERMISSIONS[role]).toContain('settings.view');
    expect(ROLE_PERMISSIONS[role]).toContain('students.delete');
  });

  test.each(['teacher', 'student', 'parent', 'accountant'])('%s does NOT receive school configuration update permissions', (role) => {
    expect(ROLE_PERMISSIONS[role]).not.toContain('settings.update');
    expect(ROLE_PERMISSIONS[role]).not.toContain('settings.manage');
  });
});
