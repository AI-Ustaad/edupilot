// lib/auth/index.ts
// ⚠️ STRICTLY CLIENT-SAFE EXPORTS ONLY

export { PERMISSIONS } from "./permissions";
export type { Permission } from "./permissions";

export { ROLE_PERMISSIONS, ROLES } from "./roles";
export type { Role } from "./roles";

// ✅ اب ہم صرف محفوظ فرنٹ اینڈ لاجک امپورٹ کر رہے ہیں
export { hasPermission, hasAnyPermission, hasAllPermissions } from "./client-rbac";

export { loginWithGoogle } from "./auth-client";
