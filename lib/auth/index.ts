// ==========================================
// 🛡️ AUTH MODULE - STRICTLY CLIENT-SAFE EXPORTS
// ==========================================

export { PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

export { ROLE_PERMISSIONS, ROLES } from "./roles";
export type { Role } from "./roles";

// Client-safe RBAC utilities
export { hasPermission, hasAnyPermission, hasAllPermissions } from "./client-rbac";

export { loginWithGoogle } from "./auth-client";
