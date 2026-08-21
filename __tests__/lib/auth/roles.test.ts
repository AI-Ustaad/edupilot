import { ROLE_PERMISSIONS } from '@/lib/auth/roles';

describe('ROLE_PERMISSIONS', () => {
  test.each(['schoolAdmin', 'superAdmin'])('%s receives the canonical administrator permissions', (role) => {
    expect(ROLE_PERMISSIONS[role]).toEqual(ROLE_PERMISSIONS.admin);
    expect(ROLE_PERMISSIONS[role]).toContain('settings.manage');
    expect(ROLE_PERMISSIONS[role]).toContain('students.delete');
  });
});
