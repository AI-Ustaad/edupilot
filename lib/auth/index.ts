// lib/auth/index.ts
// ==========================================
// 🛡️ AUTH MODULE - CENTRAL EXPORTS
// ==========================================

// Permissions (from permissions.ts)
export { PERMISSIONS, ROLE_PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

// RBAC Middleware (from rbac.ts)
export { withPermission } from "./rbac";

// Auth Server (from auth-server.ts)
export { getSessionUser } from "./auth-server";

// Auth Client (from auth-client.ts)
export { loginWithGoogle } from "./auth-client";
