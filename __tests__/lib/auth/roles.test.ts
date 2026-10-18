import { ROLE_PERMISSIONS } from '@/lib/auth/roles';

describe('ROLE_PERMISSIONS', () => {
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
