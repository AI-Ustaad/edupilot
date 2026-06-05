export const dynamic = 'force-dynamic';
import { invalidateCache } from "@/lib/cache";
// app/api/attendance/[id]/route.ts
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { logAction } from "@/lib/audit";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";   // ← درست جگہ

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(
        async (req: Request, { tenantId }: WithTenantContext) => {
          const id = getIdFromUrl(req);
          const service = new AttendanceService(new AttendanceRepository());
          const record = await service.getById(id, tenantId);
          if (!record) {
    await invalidateCache(`dashboard:${tenantId}`);
            return createApiResponse(404, null, "Attendance record not found");
          }
    await invalidateCache(`dashboard:${tenantId}`);
          return createApiResponse(200, record);
        }
      )
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.update)(
        async (req: Request, { tenantId, user }: WithTenantContext) => {
          const id = getIdFromUrl(req);
          const body = await req.json();
          const service = new AttendanceService(new AttendanceRepository());
          await service.updateAttendance(id, body, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
          return createApiResponse(200, null, "Attendance updated successfully");
        }
      )
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.delete)(
        async (req: Request, { tenantId, user }: WithTenantContext) => {
          const id = getIdFromUrl(req);
          const service = new AttendanceService(new AttendanceRepository());
          const record = await service.getById(id, tenantId);
          if (!record) {
    await invalidateCache(`dashboard:${tenantId}`);
            return createApiResponse(404, null, "Attendance record not found");
          }

          await service.deleteAttendance(id, tenantId);

          // Audit log
          await logAction({
            action: "ATTENDANCE_DELETED",
            userId: user.uid,
            tenantId,
            entityId: id,
            entityType: "attendance",
            metadata: {
              studentId: (record as any).studentId,
              date: (record as any).date,
            },
          });

    await invalidateCache(`dashboard:${tenantId}`);
          return createApiResponse(200, null, "Attendance record deleted successfully");
        }
      )
    )
  )
);
