export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { ParentsService } from "@/services/parents.service";
import { AttendanceService } from "@/services/attendance.service";
import { FeesService } from "@/services/fees.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.parents.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const parentService = new ParentsService();
        const attendanceService = new AttendanceService();
        const feesService = new FeesService();
        
        const children = await parentService.getChildren(user.uid, tenantId);
        const childIds = children.map(c => c.id);

        if (childIds.length === 0) {
          return createSuccessResponse([]);
        }

        const allAttendance = await attendanceService.findByStudentIds(tenantId, childIds, 5);

        const attendanceByStudent: Record<string, string> = {};
        for (const rec of allAttendance) {
          const sid = (rec as any).studentId;
          if (!attendanceByStudent[sid]) {
            attendanceByStudent[sid] = (rec as any).status;
          }
        }

        const feesPromises = childIds.map(id =>
          feesService.listFees(tenantId, id, 1, 1).catch(() => ({ data: [] }))
        );
        const feesResults = await Promise.all(feesPromises);

        const dashboardData = children.map((child, index) => ({
          student: child,
          todayAttendance: attendanceByStudent[child.id] || 'N/A',
          recentFee: feesResults[index]?.data?.[0] || null,
        }));

        return createSuccessResponse(dashboardData);
      })
    )
  )
);
