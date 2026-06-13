// lib/auth/rbac.ts
// ==========================================
// 🛡️ RBAC MIDDLEWARE HELPERS (Simplified)
// ==========================================

import { NextResponse } from "next/server";
import type { TenantContext } from "@/types/api";
import { type Permission, PERMISSIONS } from "./permissions";
import { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY, type Role } from "./roles";

/**
 * Extended Tenant Context with user role
 */
export interface RBACContext extends TenantContext {
  userRole: Role;
  userPermissions: Permission[];
}

/**
 * ✅ SIMPLIFIED withPermission - No generic confusion
 */
export function withPermission(requiredPermission: Permission | Permission[]) {
  return function(
    handler: (req: Request, ctx: RBACContext) => Promise<NextResponse>
  ) {
    return async (req: Request, ctx: TenantContext): Promise<NextResponse> => {
      const userRole = (ctx.user as any)?.role as Role | undefined;
      
      // If no role, deny access
      if (!userRole) {
        return NextResponse.json(
          { success: false, error: "User role not found" },
          { status: 403 }
        );
      }

      // Super admin bypasses all checks
      if (userRole === ROLES.SUPER_ADMIN) {
        const rbacCtx: RBACContext = {
          ...ctx,
          userRole,
          userPermissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN],
        };
        return handler(req, rbacCtx);
      }

      // Check permissions
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];
      const requiredPermissions = Array.isArray(requiredPermission) 
        ? requiredPermission 
        : [requiredPermission];

      const hasAllPermissions = requiredPermissions.every(p => 
        userPermissions.includes(p)
      );

      if (!hasAllPermissions) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Insufficient permissions",
            required: requiredPermissions,
            role: userRole,
          },
          { status: 403 }
        );
      }

      const rbacCtx: RBACContext = {
        ...ctx,
        userRole,
        userPermissions,
      };

      return handler(req, rbacCtx);
    };
  };
}

/**
 * ✅ SIMPLIFIED withAnyPermission
 */
export function withAnyPermission(requiredPermissions: Permission[]) {
  return function(
    handler: (req: Request, ctx: RBACContext) => Promise<NextResponse>
  ) {
    return async (req: Request, ctx: TenantContext): Promise<NextResponse> => {
      const userRole = (ctx.user as any)?.role as Role | undefined;
      
      if (!userRole) {
        return NextResponse.json(
          { success: false, error: "User role not found" },
          { status: 403 }
        );
      }

      if (userRole === ROLES.SUPER_ADMIN) {
        const rbacCtx: RBACContext = {
          ...ctx,
          userRole,
          userPermissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN],
        };
        return handler(req, rbacCtx);
      }

      const userPermissions = ROLE_PERMISSIONS[userRole] || [];
      const hasAnyPermission = requiredPermissions.some(p => 
        userPermissions.includes(p)
      );

      if (!hasAnyPermission) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Insufficient permissions",
            required: requiredPermissions,
            role: userRole,
          },
          { status: 403 }
        );
      }

      const rbacCtx: RBACContext = {
        ...ctx,
        userRole,
        userPermissions,
      };

      return handler(req, rbacCtx);
    };
  };
}

/**
 * ✅ SIMPLIFIED withMinRole
 */
export function withMinRole(minRole: Role) {
  return function(
    handler: (req: Request, ctx: RBACContext) => Promise<NextResponse>
  ) {
    return async (req: Request, ctx: TenantContext): Promise<NextResponse> => {
      const userRole = (ctx.user as any)?.role as Role | undefined;
      
      if (!userRole) {
        return NextResponse.json(
          { success: false, error: "User role not found" },
          { status: 403 }
        );
      }

      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Minimum role required: ${minRole}`,
            userRole,
          },
          { status: 403 }
        );
      }

      const rbacCtx: RBACContext = {
        ...ctx,
        userRole,
        userPermissions: ROLE_PERMISSIONS[userRole] || [],
      };

      return handler(req, rbacCtx);
    };
  };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function getUserPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function canUser(role: Role, permission: Permission): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getAvailableRoles() {
  return Object.values(ROLES);
}

export function getRoleHierarchy() {
  return ROLE_HIERARCHY;
}
