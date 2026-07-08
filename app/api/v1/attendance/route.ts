export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AttendanceService } from "@/services/attendance.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";

const attendanceService = new AttendanceService();

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.attendance.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const url = new URL(req.url);
      const date = url.searchParams.get("date") || undefined;
      const classGrade = url.searchParams.get("classGrade") || undefined;
      const section = url.searchParams.get("section") || undefined;

      const filters = { date, classGrade, section };
      const records = await attendanceService.listAttendance(tenantId, filters);

      return createSuccessResponse(records);
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.attendance.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const body = await req.json();

      if (Array.isArray(body)) {
        const result = await attendanceService.createBulk(body, tenantId, context.user.uid);
        return createApiResponse(201, result);
      }

      const record = await attendanceService.createSingle(body, tenantId, context.user.uid);
      return createApiResponse(201, record, "Attendance saved");
    }
  )
);
