export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const doc = await adminDb.collection("customMenus").doc(tenantId).get();
      return createApiResponse(200, doc.data() || {});
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const menu = await req.json();
        await adminDb.collection("customMenus").doc(tenantId).set(menu, { merge: true });
        return createApiResponse(200, null, "Menu saved");
      })
    )
  )
);
