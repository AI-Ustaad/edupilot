import { AttendanceService } from "@/services/attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { withPermission } from "@/lib/auth/withPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// Initialize Service with its Repository (Dependency Injection)
const attendanceService = new AttendanceService(new AttendanceRepository());

// 🟢 GET: Fetch Attendance (Protected by attendance.view)
export const GET = withPermission(PERMISSIONS.attendance.view, async (req: Request, context: any) => {
  try {
    const tenantId = context.user.tenantId; // From auth middleware
    const url = new URL(req.url);
    const date = url.searchParams.get("date") || undefined;
    const classGrade = url.searchParams.get("classGrade") || undefined;
    const section = url.searchParams.get("section") || undefined;

    const records = await attendanceService.listAttendance(tenantId, { date, classGrade, section });
    return successResponse(records, "Attendance records fetched successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch attendance records", 500);
  }
});

// 🔵 POST: Mark Attendance (Protected by attendance.create)
export const POST = withPermission(PERMISSIONS.attendance.create, async (req: Request, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const userId = context.user.uid;
    const body = await req.json();

    // Check if it's a Bulk Attendance submission (Array) or Single Student (Object)
    if (Array.isArray(body)) {
      const result = await attendanceService.createBulk(body, tenantId, userId);
      return successResponse(result, result.message, 201);
    } else {
      const record = await attendanceService.createSingle(body, tenantId, userId);
      return successResponse(record, "Attendance marked successfully", 201);
    }
  } catch (error: any) {
    // Return 400 Bad Request for Validation Errors (Zod)
    const status = error.message.includes("Validation") ? 400 : 500;
    return errorResponse(error.message || "Failed to mark attendance", status);
  }
});
