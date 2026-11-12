export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { createSuccessResponse, createApiResponse, createErrorResponse } from "@/lib/api/response";
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

        const enrichedLeaves = await Promise.all(
          leaves.map(async (leave) => {
            const teacherName = leave.teacherName || (leave.teacherId ? await leaveService.getStaffName(leave.teacherId, tenantId) : "Staff Member");
            return {
              ...leave,
              teacherName,
            };
          })
        );

        return createSuccessResponse(enrichedLeaves);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const { teacherId, teacherName, leaveType, startDate, endDate, reason } = body;

        if (!teacherId || !startDate || !endDate) {
          return createErrorResponse(400, "teacherId, startDate, and endDate are required");
        }

        const leaveService = new LeaveService();
        const resolvedName = teacherName || (await leaveService.getStaffName(teacherId, tenantId));

        const id = await leaveService.createLeaveRequest({
          teacherId,
          teacherName: resolvedName,
          leaveType: leaveType || "Casual",
          startDate,
          endDate,
          reason: reason || "Personal",
          status: "pending",
          createdBy: user?.uid || "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        }, tenantId);

        return createApiResponse(201, { id, status: "pending" }, "Leave request submitted successfully");
      })
    )
  )
);
