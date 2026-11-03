// lib/auth/rbac-guard.ts
// Pure Edge-compatible and server-compatible RBAC and multi-tenant isolation helper.

export const SUPER_ADMIN_ROLES = ["superAdmin", "super_admin", "super-admin"] as const;

export const ADMIN_ROLES = [
  "admin",
  "schoolAdmin",
  "principal",
  ...SUPER_ADMIN_ROLES,
] as const;

export const TEACHER_ROLES = [
  "teacher",
  ...ADMIN_ROLES,
] as const;

export const PARENT_ROLES = [
  "parent",
  ...ADMIN_ROLES,
] as const;

export const STUDENT_ROLES = [
  "student",
  ...ADMIN_ROLES,
] as const;

export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  return SUPER_ADMIN_ROLES.includes(role as any);
}

export function isTenantAdmin(role?: string | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as any);
}

export function isTeacher(role?: string | null): boolean {
  if (!role) return false;
  return TEACHER_ROLES.includes(role as any);
}

export function isParent(role?: string | null): boolean {
  if (!role) return false;
  return PARENT_ROLES.includes(role as any);
}

export function isStudent(role?: string | null): boolean {
  if (!role) return false;
  return STUDENT_ROLES.includes(role as any);
}

/**
 * Validates whether a user is authorized to access data belonging to targetTenantId.
 * Super Admins can access any tenant.
 * Other roles can ONLY access their own assigned tenantId.
 */
export function validateTenantAccess(
  userTenantId: string | null | undefined,
  targetTenantId: string,
  role?: string | null
): boolean {
  if (isSuperAdmin(role)) {
    return true;
  }
  if (!userTenantId || !targetTenantId) {
    return false;
  }
  return userTenantId === targetTenantId;
}

/**
 * Strictly enforces tenant scoping for non-super-admins, ignoring or overriding
 * any tenantId supplied by the client.
 */
export function enforceTenantScope(
  user: { tenantId?: string | null; role?: string | null },
  requestedTenantId?: string | null
): string {
  if (isSuperAdmin(user.role) && requestedTenantId) {
    return requestedTenantId;
  }
  return user.tenantId || "";
}

export interface RouteRoleCheckResult {
  allowed: boolean;
  requiredRoles?: readonly string[];
}

function matchesPathSegment(pathname: string, segment: string): boolean {
  return pathname === segment || pathname.startsWith(segment + "/");
}

/**
 * Checks path-level role restrictions for middleware or API routing.
 */
export function checkRouteRole(
  pathname: string,
  role?: string | null
): RouteRoleCheckResult {
  const normalizedRole = role || "guest";

  // Super-admin only paths
  if (
    matchesPathSegment(pathname, "/super-admin") ||
    matchesPathSegment(pathname, "/api/v1/super-admin")
  ) {
    return {
      allowed: isSuperAdmin(normalizedRole),
      requiredRoles: SUPER_ADMIN_ROLES,
    };
  }

  // Admin / billing paths
  if (
    matchesPathSegment(pathname, "/admin") ||
    matchesPathSegment(pathname, "/settings/billing") ||
    matchesPathSegment(pathname, "/api/v1/admin") ||
    matchesPathSegment(pathname, "/api/v1/billing") ||
    matchesPathSegment(pathname, "/api/v1/subscriptions/manage")
  ) {
    // Exemption for initial school setup / onboarding
    if (pathname === "/admin/school-setup") {
      return { allowed: true };
    }
    return {
      allowed: isTenantAdmin(normalizedRole),
      requiredRoles: ADMIN_ROLES,
    };
  }

  // Teacher specific paths
  if (
    matchesPathSegment(pathname, "/teacher") ||
    matchesPathSegment(pathname, "/api/v1/teacher")
  ) {
    return {
      allowed: TEACHER_ROLES.includes(normalizedRole as any),
      requiredRoles: TEACHER_ROLES,
    };
  }

  // Parent specific paths
  if (
    matchesPathSegment(pathname, "/parent") ||
    matchesPathSegment(pathname, "/api/v1/parent")
  ) {
    return {
      allowed: PARENT_ROLES.includes(normalizedRole as any),
      requiredRoles: PARENT_ROLES,
    };
  }

  // Student specific paths
  if (
    matchesPathSegment(pathname, "/student") ||
    matchesPathSegment(pathname, "/api/v1/student")
  ) {
    return {
      allowed: STUDENT_ROLES.includes(normalizedRole as any),
      requiredRoles: STUDENT_ROLES,
    };
  }

  return { allowed: true };
}
