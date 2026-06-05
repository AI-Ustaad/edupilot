export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const snapshot = await adminDb
          .collection("logs")
          .where("tenantId", "==", tenantId)
          .orderBy("createdAt", "desc")
          .limit(500)
          .get();
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return createApiResponse(200, logs);
      })
    )
  )
);
