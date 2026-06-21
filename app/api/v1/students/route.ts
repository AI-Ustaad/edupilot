// app/api/v1/students/route.ts
export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/student.service";
import { StudentRepository } from "@/repositories/student.repository";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

const studentService = new StudentService(new StudentRepository());

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.students.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const students = await studentService.listStudents(tenantId, 1, 9999);
      return successResponse(students.data || students, "Students fetched");
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.students.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      let body;
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body", 400);
      }

      // Required fields
      if (!body.fullName || !body.classGrade) {
        return errorResponse("Full Name and Class/Grade are required", 400);
      }

      // Add tenant and creator
      body.tenantId = tenantId;
      body.createdBy = context.user.uid;

      const student = await studentService.createStudent(body, tenantId);
      return successResponse(student, "Student admitted successfully", 201);
    }
  )
);
