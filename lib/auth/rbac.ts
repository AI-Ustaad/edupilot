import { NextResponse } from 'next/server';
import { Permission, ROLE_PERMISSIONS } from '@/lib/auth/permissions';

export function withPermission(requiredPermission: Permission) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = context.user;

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const allowedPermissions =
        ROLE_PERMISSIONS[user.role] || [];

      if (!allowedPermissions.includes(requiredPermission)) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      return handler(req, context);
    };
  };
}
