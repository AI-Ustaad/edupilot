// route-helpers/withAuthAndPermission.ts
import { withAuth } from "./withAuth";
import { withPermission } from "@/lib/auth/withPermission";   // آپ کی own withPermission فائل
import type { Permission } from "@/lib/auth/permissions";

export function withAuthAndPermission(permission: Permission, handler: Function) {
  // withPermission دو آرگیومنٹس لیتا ہے: (requiredPermission, handler)
  return withAuth(withPermission(permission, handler));
}
