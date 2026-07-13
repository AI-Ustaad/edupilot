import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const runtime = "nodejs";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const doc = await adminDb.collection("tenants").doc(tenantId).collection("settings").doc("general").get();
        return createSuccessResponse(doc.exists ? doc.data() : {});
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        await adminDb.collection("tenants").doc(tenantId).collection("settings").doc("general").set({
          ...body,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return createSuccessResponse(null, { message: "Settings updated successfully" });
      })
    )
  )
);
