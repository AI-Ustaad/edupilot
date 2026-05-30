// lib/auth/rbac.ts
import { NextResponse } from 'next/server';
import { Permission, ROLE_PERMISSIONS } from './permissions';

/**
 * Higher‑order function that checks if the current user has the required permission.
 * It expects that `context.user` has been populated by `withAuth` (or similar).
 */
export function withPermission(requiredPermission: Permission) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = context.user;
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const allowedPermissions = ROLE_PERMISSIONS[user.role] || [];
      if (!allowedPermissions.includes(requiredPermission)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return handler(req, context);
    };
  };
}
