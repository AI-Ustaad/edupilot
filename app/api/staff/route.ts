import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const snapshot = await adminDb
          .collection("staff")
          .where("tenantId", "==", tenantId)
          .orderBy("createdAt", "desc")
          .get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return createApiResponse(200, data);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        if (!body.personal?.fullName) {
          return createApiResponse(400, null, "Missing required fields");
        }

        const docRef = await adminDb.collection("staff").add({
          ...body,
          tenantId,
          createdBy: user.uid,
          createdAt: dbTimestamp.now(),
          updatedAt: dbTimestamp.now(),
        });
        return createApiResponse(201, { id: docRef.id }, "Staff member added");
      })
    )
  )
);
