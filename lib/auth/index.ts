// lib/auth/index.ts
// ==========================================
// 🛡️ AUTH MODULE - CENTRAL EXPORTS
// ==========================================

// Permissions (from permissions.ts)
export { PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

// Roles (from roles.ts)
export { ROLE_PERMISSIONS } from "./roles";
export type { Role } from "./roles";

// RBAC Middleware (from rbac.ts)
export { withPermission } from "./rbac";

// Auth Server (from auth-server.ts)
export { getSessionUser } from "./auth-server";

// Auth Client (from auth-client.ts)
export { loginWithGoogle } from "./auth-client";
