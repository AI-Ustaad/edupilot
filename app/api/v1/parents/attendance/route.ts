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
        const studentId = url.searchParams.get('studentId') ?? undefined;
        const date = url.searchParams.get('date') ?? undefined;

        const parentService = new ParentsService();
        if (studentId) {
          const isParent = await parentService.isParentOf(user.uid, studentId, tenantId);
          if (!isParent) return createErrorResponse(403, "Access denied");
        }

        const attendanceService = new AttendanceService(new AttendanceRepository());

        if (studentId) {
          // Direct query for one student -- no fetch-all
          const records = await attendanceService.listAttendance(tenantId, { studentId, date });
          return createSuccessResponse(records);
        }

        // Fetch all children and query per child using targeted filters
        const childIds = await parentService.getChildIds(user.uid, tenantId);
        const allRecords: any[] = [];
        for (const childId of childIds) {
          const records = await attendanceService.listAttendance(tenantId, { studentId: childId, date });
          allRecords.push(...records);
        }
        return createSuccessResponse(allRecords);
      })
    )
  )
);
