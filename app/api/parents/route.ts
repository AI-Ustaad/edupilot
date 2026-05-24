import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["parent"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const parentDoc = await adminDb.collection("parents").doc(user.uid).get();
        if (!parentDoc.exists) {
          return createApiResponse(200, { children: [] });
        }
        const studentIds = parentDoc.data()?.studentIds || [];
        if (studentIds.length === 0) {
          return createApiResponse(200, { children: [] });
        }

        const studentsSnap = await adminDb.collection("students")
          .where("tenantId", "==", tenantId)
          .where("__name__", "in", studentIds)
          .get();
        const children = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return createApiResponse(200, { children });
      })
    )
  )
);
