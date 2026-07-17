export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LeaveRepository } from "@/repositories/leave.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(async (req: Request, { tenantId }: TenantContext) => {
        const leaveRepo = new LeaveRepository();
        const leaves = await leaveRepo.findPendingByTenant(tenantId);

        const staffRepo = new StaffRepository();
        const staffList = await staffRepo.findAll(tenantId);

        const staffMap: Record<string, string> = {};
        staffList.forEach(s => {
          staffMap[s.id] = s.personal?.fullName || "Unknown";
        });

        const enrichedLeaves = leaves.map(leave => ({
          ...leave,
          teacherName: staffMap[(leave as any).teacherId] || "Unknown Teacher"
        }));

        return createSuccessResponse(enrichedLeaves);
      })
    )
  )
);
