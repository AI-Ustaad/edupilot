import { NextResponse } from "next/server";
import { hasAnyPermission } from "./client-rbac";
import type { Permission } from "./permissions";

export function withPermission(permission: Permission | Permission[]) {
  return function (handler: Function) {
    return async function (req: Request, context: any) {
      const { user } = context || {};
      
      if (!user || !user.role) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: Role missing" },
          { status: 401 }
        );
      }

      const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
      const isAuthorized = hasAnyPermission(user.role, permissionsToCheck);

      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, message: "Forbidden: Insufficient permissions" },
          { status: 403 }
        );
      }

      return handler(req, context);
    };
  };
}
