export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const doc = await adminDb.collection("addons").doc(tenantId).get();
      return createApiResponse(200, doc.data() || {});
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.update)(async (req: Request, { tenantId }: TenantContext) => {
        const addons = await req.json();
        await adminDb.collection("addons").doc(tenantId).set(addons, { merge: true });
        return createSuccessResponse(null, { message: "Addons updated" });
      })
    )
  )
);
