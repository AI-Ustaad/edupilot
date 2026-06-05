export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { ParentsService } from "@/services/parents.service";
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { AttendanceService } from "@/services/attendance.service";
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
        const parentService = new ParentsService(new ParentsRepository(), new StudentRepository());
        const children = await parentService.getChildren(user.uid, tenantId);
        const childIds = children.map(c => c.id);

        const today = new Date().toISOString().slice(0, 10);

        const attendanceService = new AttendanceService(new AttendanceRepository());
        const attendancePromises = childIds.map(id =>
          attendanceService.listAttendance(tenantId, { date: today }).then(recs =>
            recs.filter(r => (r as any).studentId === id)
          )
        );
        const attendanceResults = await Promise.all(attendancePromises);

        const feesService = new FeesService(new FeesRepository());
        const feesPromises = childIds.map(id =>
          feesService.listFees(tenantId, id, 1, 1)
        );
        const feesResults = await Promise.all(feesPromises);

        const dashboardData = children.map((child, index) => ({
          student: child,
          todayAttendance: attendanceResults[index]?.[0]?.status || 'N/A',
          recentFee: feesResults[index]?.data?.[0] || null,
        }));

        return createApiResponse(200, dashboardData);
      })
    )
  )
);
