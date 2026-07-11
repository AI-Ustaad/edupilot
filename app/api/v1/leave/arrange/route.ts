export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { StaffRepository } from "@/repositories/staff.repository";
import { logger } from "@/lib/logger/logger";
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

        const teacherRepo = new StaffRepository();
        const teacher = await teacherRepo.findById(substituteTeacherId, tenantId);
        const teacherName = teacher?.personal?.fullName || "Teacher";
        logger.info(`Notification: ${teacherName} assigned covering duty`, { metadata: { arrangedPeriods } });

        return createSuccessResponse(null, { message: "Arrangement saved" });
      })
    )
  )
);
