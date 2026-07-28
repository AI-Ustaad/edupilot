export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LeaveService } from "@/services/leave.service";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.leaves.approve)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { leaveId, substituteTeacherId, arrangedPeriods } = await req.json();

        const leaveService = new LeaveService();
        await leaveService.updateStatus(leaveId, {
          substituteTeacherId,
          arrangements: arrangedPeriods,
          status: "approved",
          approvedAt: new Date(),
        });

        const teacherName = await leaveService.getStaffName(substituteTeacherId, tenantId);
        logger.info(`Notification: ${teacherName} assigned covering duty`, { metadata: { arrangedPeriods } });

        return createSuccessResponse(null, { message: "Arrangement saved" });
      })
    )
  )
);
