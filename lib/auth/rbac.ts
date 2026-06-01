// lib/auth/rbac.ts
import { NextResponse } from "next/server";
import { Permission, ROLE_PERMISSIONS } from "./permissions";
import { getOrSet } from "@/lib/cache";

const PERM_CACHE_TTL = 600; // 10 minutes

export function withPermission(requiredPermission: Permission) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = context.user;
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Cache key per role – permissions are static for a role in most cases
      const cacheKey = `perm:${user.role}`;
      const allowedPermissions = await getOrSet(cacheKey, PERM_CACHE_TTL, async () => {
        return ROLE_PERMISSIONS[user.role] || [];
      });

      if (!allowedPermissions.includes(requiredPermission)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return handler(req, context);
    };
  };
}
