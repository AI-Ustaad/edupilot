export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { ParentsService } from "@/services/parents.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.parents.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const parentService = new ParentsService();
        const children = await parentService.getChildren(user.uid, tenantId);
        const childIds = children.map(c => c.id);

        if (childIds.length === 0) {
          return createSuccessResponse([]);
        }

        // Batch-fetch attendance for ALL children in one query
        const attendanceRepo = new AttendanceRepository();
        const allAttendance = await attendanceRepo.findByStudentIds(tenantId, childIds, 5);

        // Group by studentId in-memory
        const attendanceByStudent: Record<string, string> = {};
        for (const rec of allAttendance) {
          const sid = (rec as any).studentId;
          if (!attendanceByStudent[sid]) {
            attendanceByStudent[sid] = rec.status;
          }
        }

        const feesService = new FeesService(new FeesRepository());
        const feesPromises = childIds.map(id =>
          feesService.listFees(tenantId, id, 1, 1)
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
