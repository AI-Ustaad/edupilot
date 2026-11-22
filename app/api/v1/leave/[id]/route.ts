export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LeaveService } from "@/services/leave.service";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission([PERMISSIONS.staff.update, PERMISSIONS.staff.manage, PERMISSIONS.leaves.update, "leaveRequests" as any])(
        async (req: Request, context: any) => {
          const tenantId = context?.tenantId;
          const leaveId = context?.params?.id || getIdFromUrl(req);
          if (!leaveId) {
            return createErrorResponse(400, "Leave ID is required");
          }

          const body = await req.json().catch(() => ({}));
          const { status } = body;
          if (!status) {
            return createErrorResponse(400, "Status is required");
          }

          const normalizedStatus = String(status).toLowerCase().trim();
          const leaveService = new LeaveService();
          await leaveService.updateStatus(
            leaveId,
            {
              status: normalizedStatus,
              updatedAt: new Date(),
              approvedAt: normalizedStatus === "approved" ? new Date() : undefined,
            },
            tenantId,
            context?.user?.uid
          );

          return createSuccessResponse({ id: leaveId, status: normalizedStatus }, { message: "Leave status updated successfully" });
        }
      )
    )
  )
);

export const PATCH = PUT;

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission([PERMISSIONS.staff.update, PERMISSIONS.staff.delete, PERMISSIONS.leaves.delete, "leaveRequests" as any])(
        async (req: Request, context: any) => {
          const tenantId = context?.tenantId;
          const leaveId = context?.params?.id || getIdFromUrl(req);
          if (!leaveId) {
            return createErrorResponse(400, "Leave ID is required");
          }

          const leaveService = new LeaveService();
          await leaveService.deleteLeave(leaveId, tenantId, context?.user?.uid);

          return createSuccessResponse({ id: leaveId }, { message: "Leave request deleted successfully" });
        }
      )
    )
  )
);
