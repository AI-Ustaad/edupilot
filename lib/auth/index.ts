// lib/auth/index.ts
// ==========================================
// 🛡️ AUTH MODULE - CENTRAL EXPORTS
// ==========================================

// Permissions (from permissions.ts)
export { PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

// Roles (from roles.ts)
export { ROLE_PERMISSIONS, ROLES } from "./roles";
export type { Role } from "./roles";

// RBAC Middleware & Helpers (from rbac.ts)
export { 
  withPermission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions 
} from "./rbac";

// Auth Server (from auth-server.ts)
export { getSessionUser } from "./auth-server";

// Auth Client (from auth-client.ts)
export { loginWithGoogle } from "./auth-client";
