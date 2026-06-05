export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { studentId, status } = await req.json(); // status: "approved" or "rejected"
        if (!studentId || !status) {
          return createApiResponse(400, null, "Missing fields");
        }

        const studentRef = adminDb.collection("students").doc(studentId);
        const studentDoc = await studentRef.get();
        if (!studentDoc.exists || studentDoc.data()?.tenantId !== tenantId) {
          return createApiResponse(404, null, "Student not found");
        }

        await studentRef.update({ admissionStatus: status, updatedAt: new Date() });
        return createApiResponse(200, { success: true });
      })
    )
  )
);
