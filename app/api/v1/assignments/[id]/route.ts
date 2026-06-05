export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const id = new URL(req.url).pathname.split("/").pop() || "";
      const doc = await adminDb.collection("assignments").doc(id).get();
      if (!doc.exists) {
        return createApiResponse(404, null, "Assignment not found");
      }
      return createApiResponse(200, { id: doc.id, ...doc.data() });
    })
  )
);
