export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { ParentsService } from "@/services/parents.service";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import type { TenantContext } from "@/types/api";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.parents.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId');
        const date = url.searchParams.get('date');

        const parentService = new ParentsService();
        if (studentId) {
          const isParent = await parentService.isParentOf(user.uid, studentId, tenantId);
          if (!isParent) return createErrorResponse(403, "Access denied");
        }

        const attendanceService = new AttendanceService(new AttendanceRepository());
        const filters: any = {};
        if (date) filters.date = date;

        if (!studentId) {
          const childIds = await parentService.getChildIds(user.uid, tenantId);
          const all = await attendanceService.listAttendance(tenantId, filters);
          const filtered = all.filter(r => childIds.includes((r as any).studentId));
          return createSuccessResponse(filtered);
        }

        const records = await attendanceService.listAttendance(tenantId, { ...filters });
        return createSuccessResponse(records.filter(r => (r as any).studentId === studentId));
      })
    )
  )
);
