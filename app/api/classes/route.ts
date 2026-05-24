import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("classes")
        .where("tenantId", "==", tenantId)
        .get();
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return createApiResponse(200, classes);
    })
  )
);
