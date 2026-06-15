import { ROLE_PERMISSIONS, Role } from "./roles";
import type { Permission } from "./permissions";
import { NextResponse } from "next/server";

// 1. Basic Checks
export function hasPermission(role: string, permission: Permission): boolean {
  if (!role) return false;
  const permissionsForRole = ROLE_PERMISSIONS[role];
  if (!permissionsForRole) return false;
  return permissionsForRole.includes(permission);
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// 2. The API Route Middleware (Fixes the build errors)
export function withPermission(permission: Permission | Permission[]) {
  return function (handler: Function) {
    return async function (req: Request, context: any) {
      // اس مڈل ویئر کو استعمال کرنے سے پہلے withAuth کا چلنا ضروری ہے
      // ہم فرض کر رہے ہیں کہ context میں user اور tenantId موجود ہے
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
