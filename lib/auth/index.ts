// lib/auth/index.ts
// ==========================================
// 🛡️ AUTH MODULE - CENTRAL EXPORTS
// ==========================================

// ==========================================
// Permissions (from permissions.ts)
// ==========================================
export { PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";
export { getAllPermissions, isValidPermission } from "./permissions";

// ==========================================
// Roles (from roles.ts)
// ==========================================
export { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } from "./roles";
export type { Role } from "./roles";
export { 
  roleHasPermission, 
  isRoleHigherOrEqual, 
  getRolesWithPermission, 
  getRoleDisplayName, 
  isValidRole 
} from "./roles";

// ==========================================
// RBAC Middleware (from rbac.ts)
// ==========================================
export { withPermission, withAnyPermission, withMinRole } from "./rbac";
export type { RBACContext } from "./rbac";
export { getUserPermissions, canUser, getAvailableRoles, getRoleHierarchy } from "./rbac";

// ==========================================
// Auth Client (from auth-client.ts)
// ==========================================
export { loginWithGoogle } from "./auth-client";
