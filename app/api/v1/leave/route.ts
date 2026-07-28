export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LeaveService } from "@/services/leave.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(async (req: Request, { tenantId }: TenantContext) => {
        const leaveService = new LeaveService();
        const leaves = await leaveService.findPendingByTenant(tenantId);

        const enrichedLeaves = leaves.map(leave => ({
          ...leave,
          teacherName: "Unknown Teacher"
        }));

        return createSuccessResponse(enrichedLeaves);
      })
    )
  )
);
