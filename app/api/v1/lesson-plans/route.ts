import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("lesson_plans")
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .limit(50)
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
        const { date, topic, objective, materials, notes } = await req.json();
        if (!date || !topic || !objective) {
          return createApiResponse(400, null, "Date, topic, and objective are required");
        }
        const ref = await adminDb.collection("lesson_plans").add({
          date,
          topic,
          objective,
          materials: materials || "",
          notes: notes || "",
          createdBy: user.uid,
          tenantId,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: ref.id });
      })
    )
  )
);
