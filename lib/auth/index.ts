// lib/auth/index.ts
export { PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

export { ROLE_PERMISSIONS } from "./roles";
export type { Role } from "./roles";

export { hasPermission, hasAnyPermission, hasAllPermissions } from "./client-rbac";
export { loginWithGoogle, loginWithFacebook, mapAuthError } from "./auth-client";
