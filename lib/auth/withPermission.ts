import { NextResponse } from "next/server";
import { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS, Role } from "@/lib/auth/roles";
import { logger } from "@/lib/logger/logger";

export function withPermission(requiredPermission: Permission, handler: Function) {
  return async (req: Request, context: any) => {
    try {
      const user = context.user; 

      if (!user || !user.role) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: Missing credentials" },
          { status: 401 }
        );
      }

      const userRole = user.role as Role;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      if (!userPermissions.includes(requiredPermission)) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Forbidden: You lack the '${requiredPermission}' permission.` 
          },
          { status: 403 }
        );
      }

      return handler(req, context);

    } catch (error) {
      logger.error("Permission check failed:", { metadata: { error } });
      return NextResponse.json(
        { success: false, message: "Internal Server Error during authorization." },
        { status: 500 }
      );
    }
  };
}
