import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb.collection("buses").where("tenantId", "==", tenantId).get();
      const buses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return createApiResponse(200, buses);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const docRef = await adminDb.collection("buses").add({
          ...body,
          tenantId,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: docRef.id });
      })
    )
  )
);
