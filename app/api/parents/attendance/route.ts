import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["parent"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        if (!studentId) return createApiResponse(400, null, "Missing studentId");

        const parentDoc = await adminDb.collection("parents").doc(user.uid).get();
        const studentIds = parentDoc.data()?.studentIds || [];
        if (!studentIds.includes(studentId)) {
          return createApiResponse(403, null, "Forbidden");
        }

        const snapshot = await adminDb.collection("attendance")
          .where("studentId", "==", studentId)
          .where("tenantId", "==", tenantId)
          .orderBy("date", "desc")
          .limit(30)
          .get();
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return createApiResponse(200, { records });
      })
    )
  )
);
