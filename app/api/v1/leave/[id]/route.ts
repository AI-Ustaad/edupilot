export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LeaveService } from "@/services/leave.service";
import type { TenantContext } from "@/types/api";

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(async (req: Request, { tenantId }: TenantContext, { params }: { params: { id: string } }) => {
        const leaveId = params?.id;
        if (!leaveId) {
          return createErrorResponse(400, "Leave ID is required");
        }

        const body = await req.json();
        const { status } = body;
        if (!status) {
          return createErrorResponse(400, "Status is required");
        }

        const leaveService = new LeaveService();
        await leaveService.updateStatus(leaveId, {
          status,
          updatedAt: new Date(),
          approvedAt: status === "approved" ? new Date() : undefined,
        }, tenantId);

        return createSuccessResponse({ id: leaveId, status }, { message: "Leave status updated successfully" });
      })
    )
  )
);

export const PATCH = PUT;
