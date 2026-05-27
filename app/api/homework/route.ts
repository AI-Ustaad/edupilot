import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("homework")
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, data);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { title, description } = await req.json();
        if (!title || !description) {
          return createApiResponse(400, null, "Title and description are required");
        }
        const ref = await adminDb.collection("homework").add({
          title,
          description,
          createdBy: user.uid,
          tenantId,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: ref.id });
      })
    )
  )
);
