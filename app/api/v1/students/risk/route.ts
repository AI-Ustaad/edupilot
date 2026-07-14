export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { StudentRepository } from "@/repositories/student.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      async (req: Request, { tenantId }: TenantContext) => {
        try {
          const studentRepo = new StudentRepository();
          const students = await studentRepo.findAll(tenantId);
          if (students.length === 0) return createSuccessResponse([]);

          // Batch-fetch attendance for ALL students in one set of queries
          const attendanceRepo = new AttendanceRepository();
          const studentIds = students.map(s => s.id);
          const allAttendance = await attendanceRepo.findByStudentIds(tenantId, studentIds, 30);

          // Group attendance by studentId in-memory
          const attendanceByStudent: Record<string, { present: number; total: number }> = {};
          for (const rec of allAttendance) {
            const sid = (rec as any).studentId;
            if (!attendanceByStudent[sid]) attendanceByStudent[sid] = { present: 0, total: 0 };
            attendanceByStudent[sid].total++;
            if (rec.status === "Present") attendanceByStudent[sid].present++;
          }

          // Calculate risk for each student
          const riskStudents: any[] = [];
          for (const student of students) {
            const stats = attendanceByStudent[student.id] || { present: 0, total: 0 };
            const attendancePct = stats.total > 0 ? (stats.present / stats.total) * 100 : 100;

            if (attendancePct < 60) {
              riskStudents.push({
                ...student,
                attendance: Math.round(attendancePct),
                marks: 0,
                riskReason: "Low Attendance",
              });
            }
          }

          return createSuccessResponse(riskStudents);
        } catch (error: any) {
          logger.error("Risk API Error:", { metadata: { error } });
          return createApiResponse(200, []);
        }
      }
    )
  )
);
