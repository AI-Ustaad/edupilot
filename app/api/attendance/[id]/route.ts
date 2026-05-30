// app/api/attendance/[id]/route.ts
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";

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
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      const id = getIdFromUrl(req);
      const service = new AttendanceService(new AttendanceRepository());
      const record = await service.getById(id, tenantId);
      if (!record) {
        return createApiResponse(404, null, "Attendance record not found");
      }
      return createApiResponse(200, record);
    })
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin" && user.role !== "teacher") {
        return createApiResponse(403, null, "Forbidden");
      }
      const id = getIdFromUrl(req);
      const body = await req.json();
      const service = new AttendanceService(new AttendanceRepository());
      await service.updateAttendance(id, body, tenantId);
      return createApiResponse(200, null, "Attendance updated successfully");
    })
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin") {
        return createApiResponse(403, null, "Forbidden");
      }
      const id = getIdFromUrl(req);
      const service = new AttendanceService(new AttendanceRepository());
      const record = await service.getById(id, tenantId);
      if (!record) {
        return createApiResponse(404, null, "Attendance record not found");
      }
      await service.deleteAttendance(id, tenantId);
      return createApiResponse(200, null, "Attendance record deleted successfully");
    })
  )
);
