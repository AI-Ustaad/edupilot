// route-helpers/withAuthAndPermission.ts
import { withAuth } from "./withAuth";
import { withPermission } from "@/lib/auth/rbac";  // آپ کی withPermission فائل
import type { Permission } from "@/lib/auth/permissions";

export function withAuthAndPermission(permission: Permission, handler: Function) {
  return withAuth(withPermission(permission, handler));
}
