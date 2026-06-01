import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { leaveId, substituteTeacherId, arrangedPeriods } = await req.json();

        await adminDb.collection("leave_requests").doc(leaveId).update({
          substituteTeacherId,
          arrangements: arrangedPeriods,
          status: "approved",
          approvedAt: new Date(),
        });

        const teacherDoc = await adminDb.collection("staff").doc(substituteTeacherId).get();
        const teacherName = teacherDoc.data()?.personal?.fullName || "Teacher";
        console.log(`[Notification] ${teacherName} assigned covering duty: ${JSON.stringify(arrangedPeriods)}`);

        return createApiResponse(200, null, "Arrangement saved");
      })
    )
  )
);
