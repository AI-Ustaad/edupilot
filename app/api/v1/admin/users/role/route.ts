export const dynamic = 'force-dynamic';
// app/api/admin/users/role/route.ts
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin") {
        return createApiResponse(403, null, "Forbidden");
      }

      try {
        const { uid, role } = await req.json();
        if (!uid || !["admin", "teacher", "accountant"].includes(role)) {
          return createApiResponse(400, null, "Invalid input");
        }

        await adminAuth.setCustomUserClaims(uid, { role, tenantId });
        await adminDb.collection("users").doc(uid).update({ role, updatedAt: new Date() });

        return createApiResponse(200, null, "Role updated successfully");
      } catch (err) {
        console.error("Error updating role:", err);
        return createApiResponse(500, null, "Failed to update role");
      }
    })
  )
);
