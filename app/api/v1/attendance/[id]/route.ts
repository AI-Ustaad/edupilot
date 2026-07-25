export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AttendanceService } from "@/services/attendance.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(async (req: Request, { tenantId }: TenantContext) => {
        const id = getIdFromUrl(req);
        const service = new AttendanceService();
        const record = await service.getById(tenantId, id);
        if (!record) return createErrorResponse(404, "Attendance record not found");
        return createSuccessResponse(record);
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);
        const body = await req.json();
        const service = new AttendanceService();
        await service.updateAttendance(tenantId, id, body, user.uid);
        return createSuccessResponse(null, { message: "Attendance updated successfully" });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const id = getIdFromUrl(req);
        const service = new AttendanceService();
        const record = await service.getById(tenantId, id);
        if (!record) return createErrorResponse(404, "Attendance record not found");
        await service.deleteAttendance(tenantId, id, user.uid);
        return createSuccessResponse(null, { message: "Attendance record deleted successfully" });
      })
    )
  )
);
